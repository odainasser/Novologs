using Novologs.Application.Modules.Account.PurchaseInvoices.Commands.AddPurchaseInvoiceAttachments;
using Novologs.Application.Modules.Account.PurchaseInvoices.Commands.CreatePurchaseInvoice;
using Novologs.Application.Modules.Account.PurchaseInvoices.Commands.DeletePurchaseInvoice;
using Novologs.Application.Modules.Account.PurchaseInvoices.Commands.PostPurchaseInvoice;
using Novologs.Application.Modules.Account.PurchaseInvoices.Commands.UpdatePurchaseInvoice;
using Novologs.Application.Modules.Account.PurchaseInvoices.Queries.GetPurchaseInvoice;
using Novologs.Application.Modules.Account.PurchaseInvoices.Queries.GetPurchaseInvoices;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;
using SystemLoaders.Common.JsonConverters;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class PurchaseInvoicesEndpoint : EndpointGroupBase
{
    private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter(), new GuidConverter(), new NullableGuidConverter() }
    };

    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/purchase-invoices")
            .RequireAuthorization()
            .WithTags("Purchase Invoices")
            .WithOpenApi();

        group.MapPost("/", CreatePurchaseInvoice)
            .WithName("CreatePurchaseInvoice")
            .WithDescription("Create a new purchase invoice. Optionally link to a Confirmed PO via 'PurchaseOrderId'. Send as multipart/form-data: 'data' field (JSON) + optional 'files' file uploads.")
            .DisableAntiforgery();

        group.MapPost("/list", GetPurchaseInvoices)
            .WithName("GetPurchaseInvoices")
            .WithDescription("Get a paginated, filterable list of purchase invoices.");

        group.MapGet("/{id:int}", GetPurchaseInvoice)
            .WithName("GetPurchaseInvoice")
            .WithDescription("Get a purchase invoice by ID including all line items and attachments.");

        group.MapPut("/{id:int}", UpdatePurchaseInvoice)
            .WithName("UpdatePurchaseInvoice")
            .WithDescription("Update a Draft purchase invoice. Send as multipart/form-data: 'data' field (JSON) + optional 'files' file uploads.")
            .DisableAntiforgery();

        group.MapDelete("/{id:int}", DeletePurchaseInvoice)
            .WithName("DeletePurchaseInvoice")
            .WithDescription("Soft-delete a Draft purchase invoice.");

        group.MapPost("/{id:int}/post", PostPurchaseInvoice)
            .WithName("PostPurchaseInvoice")
            .WithDescription("Post a Draft invoice: creates a balanced journal entry (Debit/Credit for GrandTotal), marks the invoice as Posted, and updates the linked PO status to Invoiced if applicable.");
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

    private async Task<IResult> CreatePurchaseInvoice(
        [FromServices] ISender sender,
        [FromServices] IFileUtileService fileService,
        [FromForm] string data,
        IFormFileCollection? files)
    {
        CreatePurchaseInvoiceCommand command;
        try
        {
            command = JsonSerializer.Deserialize<CreatePurchaseInvoiceCommand>(data, _jsonOptions)
                ?? throw new InvalidOperationException("Null result.");
        }
        catch
        {
            return Results.BadRequest(new[] { new { Code = "INV_400_INVALID_JSON", Message = "The 'data' form field must contain valid JSON." } });
        }

        var result = await sender.Send(command);
        if (!result.Succeeded)
            return ToResult(result);

        var invoiceId = result.SuccessStatus!.Id;

        if (files != null && files.Count > 0)
        {
            var folder      = $"Accounts/PurchaseInvoices/{invoiceId}";
            var attachments = await UploadFilesAsync(fileService, files, folder);
            if (attachments.Count > 0)
            {
                await sender.Send(new AddPurchaseInvoiceAttachmentsCommand
                {
                    PurchaseInvoiceId = invoiceId,
                    Attachments       = attachments
                });
            }
        }

        return Results.Created($"/api/purchase-invoices/{invoiceId}", result);
    }

    private async Task<IResult> GetPurchaseInvoices(
        [FromServices] ISender sender,
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] GetPurchaseInvoicesQuery? query)
    {
        var result = await sender.Send(query ?? new GetPurchaseInvoicesQuery());
        return ToResult(result);
    }

    private async Task<IResult> GetPurchaseInvoice(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new GetPurchaseInvoiceQuery(id));
        return ToResult(result);
    }

    private async Task<IResult> UpdatePurchaseInvoice(
        [FromServices] ISender sender,
        [FromServices] IFileUtileService fileService,
        int id,
        [FromForm] string data,
        IFormFileCollection? files)
    {
        UpdatePurchaseInvoiceCommand command;
        try
        {
            command = JsonSerializer.Deserialize<UpdatePurchaseInvoiceCommand>(data, _jsonOptions)
                ?? throw new InvalidOperationException("Null result.");
        }
        catch
        {
            return Results.BadRequest(new[] { new { Code = "INV_400_INVALID_JSON", Message = "The 'data' form field must contain valid JSON." } });
        }

        var result = await sender.Send(command with { Id = id });
        if (!result.Succeeded)
            return ToResult(result);

        if (files != null && files.Count > 0)
        {
            var folder      = $"Accounts/PurchaseInvoices/{id}";
            var attachments = await UploadFilesAsync(fileService, files, folder);
            if (attachments.Count > 0)
            {
                await sender.Send(new AddPurchaseInvoiceAttachmentsCommand
                {
                    PurchaseInvoiceId = id,
                    Attachments       = attachments
                });
            }
        }

        return ToResult(result);
    }

    private async Task<IResult> DeletePurchaseInvoice(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new DeletePurchaseInvoiceCommand(id));
        return ToResult(result);
    }

    private async Task<IResult> PostPurchaseInvoice(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new PostPurchaseInvoiceCommand(id));
        return ToResult(result);
    }
}
