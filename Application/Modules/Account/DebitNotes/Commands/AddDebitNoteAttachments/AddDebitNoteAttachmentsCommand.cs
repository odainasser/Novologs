using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Account.DebitNotes.Commands.AddDebitNoteAttachments;

public class DebitNoteAttachmentRequest
{
    public string FileName { get; init; } = default!;
    public string FileUrl { get; init; } = default!;
    public string FilePath { get; init; } = default!;
    public string? MimeType { get; init; }
    public long? FileSize { get; init; }
}

[AuthorizePermission(Permissions.Accounting.AddDebitNoteAttachment)]
public record AddDebitNoteAttachmentsCommand : IRequest<Result<bool>>
{
    public int DebitNoteId { get; init; }
    public List<DebitNoteAttachmentRequest> Attachments { get; init; } = new();
}

public class AddDebitNoteAttachmentsCommandHandler : IRequestHandler<AddDebitNoteAttachmentsCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public AddDebitNoteAttachmentsCommandHandler(ITenantDbContext context, IUser user)
    {
        _context = context;
        _user    = user;
    }

    public async Task<Result<bool>> Handle(AddDebitNoteAttachmentsCommand request, CancellationToken cancellationToken)
    {
        var note = await _context.GetSet<Novologs.Domain.Entities.DebitNote>()
            .FirstOrDefaultAsync(n => n.Id == request.DebitNoteId && !n.IsDeleted, cancellationToken);

        if (note is null)
            return Result<bool>.Failure("DN_404_NOT_FOUND", "Debit note not found.");

        foreach (var a in request.Attachments)
        {
            await _context.GetSet<Novologs.Domain.Entities.DebitNoteAttachment>().AddAsync(
                new Novologs.Domain.Entities.DebitNoteAttachment
                {
                    DebitNoteId = note.Id,
                    FileName    = a.FileName,
                    FileUrl     = a.FileUrl,
                    FilePath    = a.FilePath,
                    MimeType    = a.MimeType,
                    FileSize    = a.FileSize,
                    UploadedAt  = DateTime.UtcNow,
                    UploadedBy  = _user.Id ?? "system"
                }, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
