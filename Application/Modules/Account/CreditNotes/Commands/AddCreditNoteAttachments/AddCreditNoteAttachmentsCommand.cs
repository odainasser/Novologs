using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Account.CreditNotes.Commands.AddCreditNoteAttachments;

public class CreditNoteAttachmentRequest
{
    public string FileName { get; init; } = default!;
    public string FileUrl { get; init; } = default!;
    public string FilePath { get; init; } = default!;
    public string? MimeType { get; init; }
    public long? FileSize { get; init; }
}

[AuthorizePermission(Permissions.Accounting.AddCreditNoteAttachment)]
public record AddCreditNoteAttachmentsCommand : IRequest<Result<bool>>
{
    public int CreditNoteId { get; init; }
    public List<CreditNoteAttachmentRequest> Attachments { get; init; } = new();
}

public class AddCreditNoteAttachmentsCommandHandler : IRequestHandler<AddCreditNoteAttachmentsCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public AddCreditNoteAttachmentsCommandHandler(ITenantDbContext context, IUser user)
    {
        _context = context;
        _user    = user;
    }

    public async Task<Result<bool>> Handle(AddCreditNoteAttachmentsCommand request, CancellationToken cancellationToken)
    {
        var note = await _context.GetSet<Novologs.Domain.Entities.CreditNote>()
            .FirstOrDefaultAsync(n => n.Id == request.CreditNoteId && !n.IsDeleted, cancellationToken);

        if (note is null)
            return Result<bool>.Failure("CN_404_NOT_FOUND", "Credit note not found.");

        foreach (var a in request.Attachments)
        {
            await _context.GetSet<Novologs.Domain.Entities.CreditNoteAttachment>().AddAsync(
                new Novologs.Domain.Entities.CreditNoteAttachment
                {
                    CreditNoteId = note.Id,
                    FileName     = a.FileName,
                    FileUrl      = a.FileUrl,
                    FilePath     = a.FilePath,
                    MimeType     = a.MimeType,
                    FileSize     = a.FileSize,
                    UploadedAt   = DateTime.UtcNow,
                    UploadedBy   = _user.Id ?? "system"
                }, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
