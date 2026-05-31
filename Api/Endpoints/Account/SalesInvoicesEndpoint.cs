using Novologs.Application.Modules.Account.SalesInvoices.Commands.AddSalesInvoiceAttachments;
using Novologs.Application.Modules.Account.SalesInvoices.Commands.CreateSalesInvoice;
using Novologs.Application.Modules.Account.SalesInvoices.Commands.DeleteSalesInvoice;
using Novologs.Application.Modules.Account.SalesInvoices.Commands.PostSalesInvoice;
using Novologs.Application.Modules.Account.SalesInvoices.Commands.UpdateSalesInvoice;
using Novologs.Application.Modules.Account.SalesInvoices.Queries.GetSalesInvoice;
using Novologs.Application.Modules.Account.SalesInvoices.Queries.GetSalesInvoices;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;
using SystemLoaders.Common.JsonConverters;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class SalesInvoicesEndpoint : EndpointGroupBase
{
    private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter(), new GuidConverter(), new NullableGuidConverter() }
    };

    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/sales-invoices")
            .RequireAuthorization()
            .WithTags("Sales Invoices")
            .WithOpenApi();

        group.MapPost("/", CreateSalesInvoice)
            .WithName("CreateSalesInvoice")
            .WithDescription("Create a new sales invoice. Send as multipart/form-data: 'data' field (JSON) + optional 'files' file uploads.")
            .DisableAntiforgery();

        group.MapPost("/list", GetSalesInvoices)
            .WithName("GetSalesInvoices")
            .WithDescription("Get a paginated, filterable list of sales invoices.");

        group.MapGet("/{id:int}", GetSalesInvoice)
            .WithName("GetSalesInvoice")
            .WithDescription("Get a sales invoice by ID including all line items and attachments.");

        group.MapPut("/{id:int}", UpdateSalesInvoice)
            .WithName("UpdateSalesInvoice")
            .WithDescription("Update a Draft sales invoice. Send as multipart/form-data: 'data' field (JSON) + optional 'files' file uploads.")
            .DisableAntiforgery();

        group.MapDelete("/{id:int}", DeleteSalesInvoice)
            .WithName("DeleteSalesInvoice")
            .WithDescription("Soft-delete a Draft sales invoice.");

        group.MapPost("/{id:int}/post", PostSalesInvoice)
            .WithName("PostSalesInvoice")
            .WithDescription("Post a Draft sales invoice: creates a balanced journal entry (Debit/Credit for GrandTotal) and marks the invoice as Posted.");
    }

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

    private async Task<IResult> CreateSalesInvoice(
        [FromServices] ISender sender,
        [FromServices] IFileUtileService fileService,
        [FromForm] string data,
        IFormFileCollection? files)
    {
        CreateSalesInvoiceCommand command;
        try
        {
            command = JsonSerializer.Deserialize<CreateSalesInvoiceCommand>(data, _jsonOptions)
                ?? throw new InvalidOperationException("Null result.");
        }
        catch
        {
            return Results.BadRequest(new[] { new { Code = "SINV_400_INVALID_JSON", Message = "The 'data' form field must contain valid JSON." } });
        }

        var result = await sender.Send(command);
        if (!result.Succeeded)
            return ToResult(result);

        var invoiceId = result.SuccessStatus!.Id;

        if (files != null && files.Count > 0)
        {
            var folder      = $"Accounts/SalesInvoices/{invoiceId}";
            var attachments = await UploadFilesAsync(fileService, files, folder);
            if (attachments.Count > 0)
            {
                await sender.Send(new AddSalesInvoiceAttachmentsCommand
                {
                    SalesInvoiceId = invoiceId,
                    Attachments    = attachments
                });
            }
        }

        return Results.Created($"/api/sales-invoices/{invoiceId}", result);
    }

    private async Task<IResult> GetSalesInvoices(
        [FromServices] ISender sender,
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] GetSalesInvoicesQuery? query)
    {
        var result = await sender.Send(query ?? new GetSalesInvoicesQuery());
        return ToResult(result);
    }

    private async Task<IResult> GetSalesInvoice(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new GetSalesInvoiceQuery(id));
        return ToResult(result);
    }

    private async Task<IResult> UpdateSalesInvoice(
        [FromServices] ISender sender,
        [FromServices] IFileUtileService fileService,
        int id,
        [FromForm] string data,
        IFormFileCollection? files)
    {
        UpdateSalesInvoiceCommand command;
        try
        {
            command = JsonSerializer.Deserialize<UpdateSalesInvoiceCommand>(data, _jsonOptions)
                ?? throw new InvalidOperationException("Null result.");
        }
        catch
        {
            return Results.BadRequest(new[] { new { Code = "SINV_400_INVALID_JSON", Message = "The 'data' form field must contain valid JSON." } });
        }

        var result = await sender.Send(command with { Id = id });
        if (!result.Succeeded)
            return ToResult(result);

        if (files != null && files.Count > 0)
        {
            var folder      = $"Accounts/SalesInvoices/{id}";
            var attachments = await UploadFilesAsync(fileService, files, folder);
            if (attachments.Count > 0)
            {
                await sender.Send(new AddSalesInvoiceAttachmentsCommand
                {
                    SalesInvoiceId = id,
                    Attachments    = attachments
                });
            }
        }

        return ToResult(result);
    }

    private async Task<IResult> DeleteSalesInvoice(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new DeleteSalesInvoiceCommand(id));
        return ToResult(result);
    }

    private async Task<IResult> PostSalesInvoice(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new PostSalesInvoiceCommand(id));
        return ToResult(result);
    }
}
