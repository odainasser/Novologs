using Novologs.Application.Modules.Account.CreditNotes.Commands.AddCreditNoteAttachments;
using Novologs.Application.Modules.Account.CreditNotes.Commands.CreateCreditNote;
using Novologs.Application.Modules.Account.CreditNotes.Commands.DeleteCreditNote;
using Novologs.Application.Modules.Account.CreditNotes.Commands.PostCreditNote;
using Novologs.Application.Modules.Account.CreditNotes.Commands.UpdateCreditNote;
using Novologs.Application.Modules.Account.CreditNotes.Queries.GetCreditNote;
using Novologs.Application.Modules.Account.CreditNotes.Queries.GetCreditNotePrefill;
using Novologs.Application.Modules.Account.CreditNotes.Queries.GetCreditNotes;
using AttachmentRequest = Novologs.Application.Modules.Account.CreditNotes.Commands.AddCreditNoteAttachments.CreditNoteAttachmentRequest;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;
using SystemLoaders.Common.JsonConverters;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class CreditNotesEndpoint : EndpointGroupBase
{
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter(), new GuidConverter(), new NullableGuidConverter() }
    };

    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/credit-notes")
            .RequireAuthorization()
            .WithTags("Credit Notes")
            //.WithOpenApi()
            .ExcludeFromDescription();

        group.MapPost("/", CreateCreditNote)
            .WithName("CreateCreditNote")
            .WithDescription("Create a new credit note. Optionally link to a Sales Invoice. Send as multipart/form-data: 'data' field (JSON) + optional 'files' uploads.")
            .DisableAntiforgery();

        group.MapPost("/list", GetCreditNotes)
            .WithName("GetCreditNotes")
            .WithDescription("Get a paginated, filterable list of credit notes.");

        group.MapGet("/{id:int}", GetCreditNote)
            .WithName("GetCreditNote")
            .WithDescription("Get a credit note by ID including all line items and attachments.");

        group.MapGet("/prefill/{salesInvoiceId:int}", GetCreditNotePrefill)
            .WithName("GetCreditNotePrefill")
            .WithDescription("Get prefilled data for creating a credit note from a sales invoice (items copied, GL accounts reversed).");

        group.MapPut("/{id:int}", UpdateCreditNote)
            .WithName("UpdateCreditNote")
            .WithDescription("Update a Draft credit note. Send as multipart/form-data: 'data' field (JSON) + optional 'files' uploads.")
            .DisableAntiforgery();

        group.MapDelete("/{id:int}", DeleteCreditNote)
            .WithName("DeleteCreditNote")
            .WithDescription("Soft-delete a Draft credit note.");

        group.MapPost("/{id:int}/post", PostCreditNote)
            .WithName("PostCreditNote")
            .WithDescription("Post a Draft credit note: creates a balanced journal entry and marks the note as Posted.");

        group.MapPost("/{id:int}/attachments", AddCreditNoteAttachments)
            .WithName("AddCreditNoteAttachments")
            .WithDescription("Upload additional attachments to an existing credit note.")
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

    private async Task<IResult> CreateCreditNote(
        [FromServices] ISender sender,
        [FromServices] IFileUtileService fileService,
        [FromForm] string data,
        IFormFileCollection? files)
    {
        CreateCreditNoteCommand command;
        try
        {
            command = JsonSerializer.Deserialize<CreateCreditNoteCommand>(data, _jsonOptions)
                ?? throw new InvalidOperationException("Null result.");
        }
        catch
        {
            return Results.BadRequest(new[] { new { Code = "CN_400_INVALID_JSON", Message = "The 'data' form field must contain valid JSON." } });
        }

        var result = await sender.Send(command);
        if (!result.Succeeded)
            return ToResult(result);

        var noteId = result.SuccessStatus!.Id;

        if (files != null && files.Count > 0)
        {
            var folder      = $"Accounts/CreditNotes/{noteId}";
            var attachments = await UploadFilesAsync(fileService, files, folder);
            if (attachments.Count > 0)
            {
                await sender.Send(new AddCreditNoteAttachmentsCommand
                {
                    CreditNoteId = noteId,
                    Attachments  = attachments
                });
            }
        }

        return Results.Created($"/api/credit-notes/{noteId}", result);
    }

    private async Task<IResult> GetCreditNotes(
        [FromServices] ISender sender,
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] GetCreditNotesQuery? query)
    {
        var result = await sender.Send(query ?? new GetCreditNotesQuery());
        return ToResult(result);
    }

    private async Task<IResult> GetCreditNote(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new GetCreditNoteQuery(id));
        return ToResult(result);
    }

    private async Task<IResult> GetCreditNotePrefill(
        [FromServices] ISender sender,
        int salesInvoiceId)
    {
        var result = await sender.Send(new GetCreditNotePrefillQuery(salesInvoiceId));
        return ToResult(result);
    }

    private async Task<IResult> UpdateCreditNote(
        [FromServices] ISender sender,
        [FromServices] IFileUtileService fileService,
        int id,
        [FromForm] string data,
        IFormFileCollection? files)
    {
        UpdateCreditNoteCommand command;
        try
        {
            command = JsonSerializer.Deserialize<UpdateCreditNoteCommand>(data, _jsonOptions)
                ?? throw new InvalidOperationException("Null result.");
        }
        catch
        {
            return Results.BadRequest(new[] { new { Code = "CN_400_INVALID_JSON", Message = "The 'data' form field must contain valid JSON." } });
        }

        var result = await sender.Send(command with { Id = id });
        if (!result.Succeeded)
            return ToResult(result);

        if (files != null && files.Count > 0)
        {
            var folder      = $"Accounts/CreditNotes/{id}";
            var attachments = await UploadFilesAsync(fileService, files, folder);
            if (attachments.Count > 0)
            {
                await sender.Send(new AddCreditNoteAttachmentsCommand
                {
                    CreditNoteId = id,
                    Attachments  = attachments
                });
            }
        }

        return ToResult(result);
    }

    private async Task<IResult> DeleteCreditNote(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new DeleteCreditNoteCommand(id));
        return ToResult(result);
    }

    private async Task<IResult> PostCreditNote(
        [FromServices] ISender sender,
        int id)
    {
        var result = await sender.Send(new PostCreditNoteCommand(id));
        return ToResult(result);
    }

    private async Task<IResult> AddCreditNoteAttachments(
        [FromServices] ISender sender,
        [FromServices] IFileUtileService fileService,
        int id,
        IFormFileCollection? files)
    {
        var folder      = $"Accounts/CreditNotes/{id}";
        var attachments = await UploadFilesAsync(fileService, files, folder);

        if (attachments.Count == 0)
            return Results.BadRequest(new[] { new { Code = "CN_400_NO_FILES", Message = "No files were uploaded." } });

        var result = await sender.Send(new AddCreditNoteAttachmentsCommand
        {
            CreditNoteId = id,
            Attachments  = attachments
        });

        return ToResult(result);
    }
}
