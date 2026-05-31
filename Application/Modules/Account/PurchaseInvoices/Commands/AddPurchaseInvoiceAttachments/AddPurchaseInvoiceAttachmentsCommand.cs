using System.Security;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Account.PurchaseInvoices.Commands.AddPurchaseInvoiceAttachments;

public class AttachmentRequest
{
    public string FileName { get; init; } = default!;
    public string FileUrl { get; init; } = default!;
    public string FilePath { get; init; } = default!;
    public string? MimeType { get; init; }
    public long? FileSize { get; init; }
}

[AuthorizePermission(Permissions.Accounting.AddPurchaseInvoiceAttachment)]
public record AddPurchaseInvoiceAttachmentsCommand : IRequest<Result<bool>>
{
    public int PurchaseInvoiceId { get; init; }
    public List<AttachmentRequest> Attachments { get; init; } = new();
}

public class AddPurchaseInvoiceAttachmentsCommandHandler : IRequestHandler<AddPurchaseInvoiceAttachmentsCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public AddPurchaseInvoiceAttachmentsCommandHandler(ITenantDbContext context, IUser user)
    {
        _context = context;
        _user    = user;
    }

    public async Task<Result<bool>> Handle(AddPurchaseInvoiceAttachmentsCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _context.GetSet<Novologs.Domain.Entities.PurchaseInvoice>()
            .FirstOrDefaultAsync(i => i.Id == request.PurchaseInvoiceId && !i.IsDeleted, cancellationToken);

        if (invoice is null)
            return Result<bool>.Failure("INV_404_NOT_FOUND", "Purchase invoice not found.");

        foreach (var a in request.Attachments)
        {
            await _context.GetSet<Novologs.Domain.Entities.PurchaseInvoiceAttachment>().AddAsync(
                new Novologs.Domain.Entities.PurchaseInvoiceAttachment
                {
                    PurchaseInvoiceId = invoice.Id,
                    FileName          = a.FileName,
                    FileUrl           = a.FileUrl,
                    FilePath          = a.FilePath,
                    MimeType          = a.MimeType,
                    FileSize          = a.FileSize,
                    UploadedAt        = DateTime.UtcNow,
                    UploadedBy        = _user.Id ?? "system"
                }, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
