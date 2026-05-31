using Novologs.Application.Modules.Account.Transactions.Commands.CreateTransaction;
using Novologs.Application.Modules.Account.Transactions.Commands.DeleteTransaction;
using Novologs.Application.Modules.Account.Transactions.Commands.PostTransaction;
using Novologs.Application.Modules.Account.Transactions.Commands.UpdateTransaction;
using Novologs.Application.Modules.Account.Transactions.DTOs;
using Novologs.Application.Modules.Account.Transactions.Queries.GetTransaction;
using Novologs.Application.Modules.Account.Transactions.Queries.GetTransactions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;
using SystemLoaders.Common.JsonConverters;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class TransactionsEndpoint : EndpointGroupBase
{
    private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter(), new GuidConverter(), new NullableGuidConverter() }
    };

    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/transactions")
            .RequireAuthorization()
            .WithTags("Transactions")
            .WithOpenApi();

        group.MapPost("/", CreateTransaction)
            .WithName("CreateTransaction")
            .WithDescription("Create a new journal transaction. Send as multipart/form-data: 'data' field (JSON) + optional 'files' file uploads.")
            .DisableAntiforgery();

        group.MapPost("/list", GetTransactions)
            .WithName("GetTransactions")
            .WithDescription("Get a paginated, sortable, and searchable list of transactions with optional date and status filters");

        group.MapGet("/{id:int}", GetTransaction)
            .WithName("GetTransaction")
            .WithDescription("Get transaction by ID");

        group.MapPut("/{id:int}", UpdateTransaction)
            .WithName("UpdateTransaction")
            .WithDescription("Update an unposted transaction. Send as multipart/form-data: 'data' field (JSON) + optional 'files' file uploads.")
            .DisableAntiforgery();

        group.MapDelete("/{id:int}", DeleteTransaction)
            .WithName("DeleteTransaction")
            .WithDescription("Delete an unposted transaction");

        group.MapPost("/{id:int}/post", PostTransaction)
            .WithName("PostTransaction")
            .WithDescription("Post a transaction â€“ sets IsPosted = true (irreversible)");
    }

    // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private static IResult ToResult<T>(Result<T> result)
    {
        if (result.Succeeded)
            return Results.Ok(result);

        var code = result.Errors.FirstOrDefault()?.Code ?? string.Empty;

        if (code.Contains("_404_"))
            return Results.NotFound(result.Errors);

        if (code.Contains("_409_"))
            return Results.Conflict(result.Errors);

        return Results.BadRequest(result.Errors);
    }

    private static async Task<List<AttachmentRequest>> UploadFilesAsync(
        IFileUtileService fileService,
        IFormFileCollection? files,
        string folder)
    {
        var attachments = new List<AttachmentRequest>();
        if (files == null || files.Count == 0)
            return attachments;

        foreach (var file in files)
        {
            var stored = await fileService.UploadFile(file, folder);
            attachments.Add(new AttachmentRequest
            {
                FileName = stored.Name ?? file.FileName,
                FileUrl  = stored.Url,
                FilePath = stored.Path,
                MimeType = stored.MimeType ?? file.ContentType,
                FileSize = stored.Size ?? file.Length
            });
        }

        return attachments;
    }

    // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private async Task<IResult> CreateTransaction(
        [FromServices] ISender sender,
        [FromServices] IFileUtileService fileService,
        [FromForm] string data,
        IFormFileCollection? files)
    {
        CreateTransactionCommand command;
        try
        {
            command = JsonSerializer.Deserialize<CreateTransactionCommand>(data, _jsonOptions)
                ?? throw new InvalidOperationException("Null result.");
        }
        catch
        {
            return Results.BadRequest(new[] { new { Code = "TXN_400_INVALID_JSON", Message = "The 'data' form field must contain valid JSON." } });
        }

        // Strip empty placeholder rows emitted by the UI (accountId = "" / Guid.Empty with no amounts).
        var filteredLines = command.Lines
            .Where(l => l.AccountId != Guid.Empty || l.Debit != 0 || l.Credit != 0)
            .ToList();

        // Upload files first, then create the transaction with attachments atomically
        // (mirrors the Update flow â€“ avoids a fragile two-phase approach).
        var uploadedAttachments = await UploadFilesAsync(fileService, files, $"Accounts/Transactions/{Guid.NewGuid()}");

        var createCommand = command with
        {
            Lines       = filteredLines,
            Attachments = uploadedAttachments.Count > 0 ? uploadedAttachments : null
        };

        var result = await sender.Send(createCommand);

        if (!result.Succeeded)
            return ToResult(result);

        return Results.Created($"/api/transactions/{result.SuccessStatus!.Id}", result);
    }

    private async Task<IResult> GetTransactions(
        [FromServices] ISender sender,
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] GetTransactionsQuery? query)
    {
        var result = await sender.Send(query ?? new GetTransactionsQuery());
        return ToResult(result);
    }

    private async Task<IResult> GetTransaction(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new GetTransactionQuery { Id = id });
        return ToResult(result);
    }

    private async Task<IResult> UpdateTransaction(
        [FromServices] ISender sender,
        [FromServices] IFileUtileService fileService,
        int id,
        [FromForm] string data,
        IFormFileCollection? files)
    {
        UpdateTransactionCommand command;
        try
        {
            command = JsonSerializer.Deserialize<UpdateTransactionCommand>(data, _jsonOptions)
                ?? throw new InvalidOperationException("Null result.");
        }
        catch
        {
            return Results.BadRequest(new[] { new { Code = "TXN_400_INVALID_JSON", Message = "The 'data' form field must contain valid JSON." } });
        }

        var folder         = $"Accounts/Transactions/{id}";
        var newAttachments = await UploadFilesAsync(fileService, files, folder);

        // Strip empty placeholder rows emitted by the UI (accountId = "" / Guid.Empty with no amounts).
        var filteredLines = command.Lines
            .Where(l => l.AccountId != Guid.Empty || l.Debit != 0 || l.Credit != 0)
            .ToList();

        var finalCommand = command with
        {
            Id             = id,
            Lines          = filteredLines,
            NewAttachments = newAttachments.Count > 0 ? newAttachments : command.NewAttachments
        };

        var result = await sender.Send(finalCommand);
        return ToResult(result);
    }

    private async Task<IResult> DeleteTransaction(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new DeleteTransactionCommand { Id = id });
        return ToResult(result);
    }

    private async Task<IResult> PostTransaction(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new PostTransactionCommand { Id = id });
        return ToResult(result);
    }
}
