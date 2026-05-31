using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Account.SalesInvoices.Commands.AddSalesInvoiceAttachments;

public class AttachmentRequest
{
    public string FileName { get; init; } = default!;
    public string FileUrl { get; init; } = default!;
    public string FilePath { get; init; } = default!;
    public string? MimeType { get; init; }
    public long? FileSize { get; init; }
}

[AuthorizePermission(Permissions.Accounting.AddSalesInvoiceAttachment)]
public record AddSalesInvoiceAttachmentsCommand : IRequest<Result<bool>>
{
    public int SalesInvoiceId { get; init; }
    public List<AttachmentRequest> Attachments { get; init; } = new();
}

public class AddSalesInvoiceAttachmentsCommandHandler : IRequestHandler<AddSalesInvoiceAttachmentsCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public AddSalesInvoiceAttachmentsCommandHandler(ITenantDbContext context, IUser user)
    {
        _context = context;
        _user    = user;
    }

    public async Task<Result<bool>> Handle(AddSalesInvoiceAttachmentsCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _context.GetSet<Novologs.Domain.Entities.SalesInvoice>()
            .FirstOrDefaultAsync(i => i.Id == request.SalesInvoiceId && !i.IsDeleted, cancellationToken);

        if (invoice is null)
            return Result<bool>.Failure("SINV_404_NOT_FOUND", "Sales invoice not found.");

        foreach (var a in request.Attachments)
        {
            await _context.GetSet<Novologs.Domain.Entities.SalesInvoiceAttachment>().AddAsync(
                new Novologs.Domain.Entities.SalesInvoiceAttachment
                {
                    SalesInvoiceId = invoice.Id,
                    FileName       = a.FileName,
                    FileUrl        = a.FileUrl,
                    FilePath       = a.FilePath,
                    MimeType       = a.MimeType,
                    FileSize       = a.FileSize,
                    UploadedAt     = DateTime.UtcNow,
                    UploadedBy     = _user.Id ?? "system"
                }, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
