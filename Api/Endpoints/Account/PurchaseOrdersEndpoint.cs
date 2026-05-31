using Novologs.Application.Modules.Account.PurchaseOrders.Commands.AddPurchaseOrderAttachments;
using Novologs.Application.Modules.Account.PurchaseOrders.Commands.CreatePurchaseOrder;
using Novologs.Application.Modules.Account.PurchaseOrders.Commands.DeletePurchaseOrder;
using Novologs.Application.Modules.Account.PurchaseOrders.Commands.UpdatePurchaseOrder;
using Novologs.Application.Modules.Account.PurchaseOrders.Queries.GetPurchaseOrder;
using Novologs.Application.Modules.Account.PurchaseOrders.Queries.GetPurchaseOrders;
using Novologs.Application.Modules.Account.Transactions.Commands.CreateTransaction;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;
using SystemLoaders.Common.JsonConverters;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class PurchaseOrdersEndpoint : EndpointGroupBase
{
    private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter(), new GuidConverter(), new NullableGuidConverter() }
    };

    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/purchase-orders")
            .RequireAuthorization()
            .WithTags("Purchase Orders")
            .WithOpenApi();

        group.MapPost("/", CreatePurchaseOrder)
            .WithName("CreatePurchaseOrder")
            .WithDescription("Create a new purchase order. Send as multipart/form-data: 'data' field (JSON) + optional 'files' file uploads.")
            .DisableAntiforgery();

        group.MapPost("/list", GetPurchaseOrders)
            .WithName("GetPurchaseOrders")
            .WithDescription("Get a paginated, filterable list of purchase orders.");

        group.MapGet("/{id:int}", GetPurchaseOrder)
            .WithName("GetPurchaseOrder")
            .WithDescription("Get a purchase order by ID including all line items and calculated totals.");

        group.MapPut("/{id:int}", UpdatePurchaseOrder)
            .WithName("UpdatePurchaseOrder")
            .WithDescription("Update a Draft purchase order. Send as multipart/form-data: 'data' field (JSON) + optional 'files' file uploads.")
            .DisableAntiforgery();

        group.MapDelete("/{id:int}", DeletePurchaseOrder)
            .WithName("DeletePurchaseOrder")
            .WithDescription("Soft-delete a Draft purchase order. Confirmed or Cancelled orders cannot be deleted.");
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

    private async Task<IResult> CreatePurchaseOrder(
        [FromServices] ISender sender,
        [FromServices] IFileUtileService fileService,
        [FromForm] string data,
        IFormFileCollection? files)
    {
        CreatePurchaseOrderCommand command;
        try
        {
            command = JsonSerializer.Deserialize<CreatePurchaseOrderCommand>(data, _jsonOptions)
                ?? throw new InvalidOperationException("Null result.");
        }
        catch
        {
            return Results.BadRequest(new[] { new { Code = "PO_400_INVALID_JSON", Message = "The 'data' form field must contain valid JSON." } });
        }

        var result = await sender.Send(command);
        if (!result.Succeeded)
            return ToResult(result);

        var poId = result.SuccessStatus!.Id;

        if (files != null && files.Count > 0)
        {
            var folder      = $"Accounts/PurchaseOrders/{poId}";
            var attachments = await UploadFilesAsync(fileService, files, folder);
            if (attachments.Count > 0)
            {
                await sender.Send(new AddPurchaseOrderAttachmentsCommand
                {
                    PurchaseOrderId = poId,
                    Attachments     = attachments
                });
            }
        }

        return Results.Created($"/api/purchase-orders/{poId}", result);
    }

    private async Task<IResult> GetPurchaseOrders(
        [FromServices] ISender sender,
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] GetPurchaseOrdersQuery? query)
    {
        var result = await sender.Send(query ?? new GetPurchaseOrdersQuery());
        return ToResult(result);
    }

    private async Task<IResult> GetPurchaseOrder(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new GetPurchaseOrderQuery(id));
        return ToResult(result);
    }

    private async Task<IResult> UpdatePurchaseOrder(
        [FromServices] ISender sender,
        [FromServices] IFileUtileService fileService,
        int id,
        [FromForm] string data,
        IFormFileCollection? files)
    {
        UpdatePurchaseOrderCommand command;
        try
        {
            command = JsonSerializer.Deserialize<UpdatePurchaseOrderCommand>(data, _jsonOptions)
                ?? throw new InvalidOperationException("Null result.");
        }
        catch
        {
            return Results.BadRequest(new[] { new { Code = "PO_400_INVALID_JSON", Message = "The 'data' form field must contain valid JSON." } });
        }

        var folder         = $"Accounts/PurchaseOrders/{id}";
        var newAttachments = await UploadFilesAsync(fileService, files, folder);

        var finalCommand = command with
        {
            Id             = id,
            NewAttachments = newAttachments.Count > 0 ? newAttachments : command.NewAttachments
        };

        var result = await sender.Send(finalCommand);

        return ToResult(result);
    }

    private async Task<IResult> DeletePurchaseOrder(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new DeletePurchaseOrderCommand(id));
        return ToResult(result);
    }
}
