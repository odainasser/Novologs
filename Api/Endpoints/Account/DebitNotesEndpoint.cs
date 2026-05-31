using Novologs.Application.Modules.Account.DebitNotes.Commands.AddDebitNoteAttachments;
using Novologs.Application.Modules.Account.DebitNotes.Commands.CreateDebitNote;
using Novologs.Application.Modules.Account.DebitNotes.Commands.DeleteDebitNote;
using Novologs.Application.Modules.Account.DebitNotes.Commands.PostDebitNote;
using Novologs.Application.Modules.Account.DebitNotes.Commands.UpdateDebitNote;
using Novologs.Application.Modules.Account.DebitNotes.Queries.GetDebitNote;
using Novologs.Application.Modules.Account.DebitNotes.Queries.GetDebitNotePrefill;
using Novologs.Application.Modules.Account.DebitNotes.Queries.GetDebitNotes;
using AttachmentRequest = Novologs.Application.Modules.Account.DebitNotes.Commands.AddDebitNoteAttachments.DebitNoteAttachmentRequest;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;
using SystemLoaders.Common.JsonConverters;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class DebitNotesEndpoint : EndpointGroupBase
{
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter(), new GuidConverter(), new NullableGuidConverter() }
    };

    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/debit-notes")
            .RequireAuthorization()
            .WithTags("Debit Notes")
            .WithOpenApi();

        group.MapPost("/", CreateDebitNote)
            .WithName("CreateDebitNote")
            .WithDescription("Create a new debit note. Optionally link to a Purchase Invoice. Send as multipart/form-data: 'data' field (JSON) + optional 'files' uploads.")
            .DisableAntiforgery();

        group.MapPost("/list", GetDebitNotes)
            .WithName("GetDebitNotes")
            .WithDescription("Get a paginated, filterable list of debit notes.");

        group.MapGet("/{id:int}", GetDebitNote)
            .WithName("GetDebitNote")
            .WithDescription("Get a debit note by ID including all line items and attachments.");

        group.MapGet("/prefill/{purchaseInvoiceId:int}", GetDebitNotePrefill)
            .WithName("GetDebitNotePrefill")
            .WithDescription("Get prefilled data for creating a debit note from a purchase invoice (items copied, GL accounts reversed).");

        group.MapPut("/{id:int}", UpdateDebitNote)
            .WithName("UpdateDebitNote")
            .WithDescription("Update a Draft debit note. Send as multipart/form-data: 'data' field (JSON) + optional 'files' uploads.")
            .DisableAntiforgery();

        group.MapDelete("/{id:int}", DeleteDebitNote)
            .WithName("DeleteDebitNote")
            .WithDescription("Soft-delete a Draft debit note.");

        group.MapPost("/{id:int}/post", PostDebitNote)
            .WithName("PostDebitNote")
            .WithDescription("Post a Draft debit note: creates a balanced journal entry and marks the note as Posted.");

        group.MapPost("/{id:int}/attachments", AddDebitNoteAttachments)
            .WithName("AddDebitNoteAttachments")
            .WithDescription("Upload additional attachments to an existing debit note.")
            .DisableAntiforgery();
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

    private async Task<IResult> CreateDebitNote(
        [FromServices] ISender sender,
        [FromServices] IFileUtileService fileService,
        [FromForm] string data,
        IFormFileCollection? files)
    {
        CreateDebitNoteCommand command;
        try
        {
            command = JsonSerializer.Deserialize<CreateDebitNoteCommand>(data, _jsonOptions)
                ?? throw new InvalidOperationException("Null result.");
        }
        catch
        {
            return Results.BadRequest(new[] { new { Code = "DN_400_INVALID_JSON", Message = "The 'data' form field must contain valid JSON." } });
        }

        var result = await sender.Send(command);
        if (!result.Succeeded)
            return ToResult(result);

        var noteId = result.SuccessStatus!.Id;

        if (files != null && files.Count > 0)
        {
            var folder      = $"Accounts/DebitNotes/{noteId}";
            var attachments = await UploadFilesAsync(fileService, files, folder);
            if (attachments.Count > 0)
            {
                await sender.Send(new AddDebitNoteAttachmentsCommand
                {
                    DebitNoteId = noteId,
                    Attachments = attachments
                });
            }
        }

        return Results.Created($"/api/debit-notes/{noteId}", result);
    }

    private async Task<IResult> GetDebitNotes(
        [FromServices] ISender sender,
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] GetDebitNotesQuery? query)
    {
        var result = await sender.Send(query ?? new GetDebitNotesQuery());
        return ToResult(result);
    }

    private async Task<IResult> GetDebitNote(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new GetDebitNoteQuery(id));
        return ToResult(result);
    }

    private async Task<IResult> GetDebitNotePrefill(
        [FromServices] ISender sender,
        int purchaseInvoiceId)
    {
        var result = await sender.Send(new GetDebitNotePrefillQuery(purchaseInvoiceId));
        return ToResult(result);
    }

    private async Task<IResult> UpdateDebitNote(
        [FromServices] ISender sender,
        [FromServices] IFileUtileService fileService,
        int id,
        [FromForm] string data,
        IFormFileCollection? files)
    {
        UpdateDebitNoteCommand command;
        try
        {
            command = JsonSerializer.Deserialize<UpdateDebitNoteCommand>(data, _jsonOptions)
                ?? throw new InvalidOperationException("Null result.");
        }
        catch
        {
            return Results.BadRequest(new[] { new { Code = "DN_400_INVALID_JSON", Message = "The 'data' form field must contain valid JSON." } });
        }

        var result = await sender.Send(command with { Id = id });
        if (!result.Succeeded)
            return ToResult(result);

        if (files != null && files.Count > 0)
        {
            var folder      = $"Accounts/DebitNotes/{id}";
            var attachments = await UploadFilesAsync(fileService, files, folder);
            if (attachments.Count > 0)
            {
                await sender.Send(new AddDebitNoteAttachmentsCommand
                {
                    DebitNoteId = id,
                    Attachments = attachments
                });
            }
        }

        return ToResult(result);
    }

    private async Task<IResult> DeleteDebitNote(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new DeleteDebitNoteCommand(id));
        return ToResult(result);
    }

    private async Task<IResult> PostDebitNote(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new PostDebitNoteCommand(id));
        return ToResult(result);
    }

    private async Task<IResult> AddDebitNoteAttachments(
        [FromServices] ISender sender,
        [FromServices] IFileUtileService fileService,
        int id,
        IFormFileCollection? files)
    {
        var folder      = $"Accounts/DebitNotes/{id}";
        var attachments = await UploadFilesAsync(fileService, files, folder);

        if (attachments.Count == 0)
            return Results.BadRequest(new[] { new { Code = "DN_400_NO_FILES", Message = "No files were uploaded." } });

        var result = await sender.Send(new AddDebitNoteAttachmentsCommand
        {
            DebitNoteId = id,
            Attachments = attachments
        });

        return ToResult(result);
    }
}
