using Novologs.Application.Modules.Account.Transactions.Commands.CreateTransaction;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Novologs.Application.Modules.Account.PurchaseOrders.Commands.AddPurchaseOrderAttachments;

[AuthorizePermission(Permissions.Accounting.AddPurchaseOrderAttachment)]
public record AddPurchaseOrderAttachmentsCommand : IRequest<Result<bool>>
{
    public int PurchaseOrderId { get; init; }
    public List<AttachmentRequest> Attachments { get; init; } = new();
}

public class AddPurchaseOrderAttachmentsCommandHandler : IRequestHandler<AddPurchaseOrderAttachmentsCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public AddPurchaseOrderAttachmentsCommandHandler(ITenantDbContext context, IUser user)
    {
        _context = context;
        _user    = user;
    }

    public async Task<Result<bool>> Handle(AddPurchaseOrderAttachmentsCommand request, CancellationToken cancellationToken)
    {
        var po = await _context.GetSet<Novologs.Domain.Entities.PurchaseOrder>()
            .FirstOrDefaultAsync(p => p.Id == request.PurchaseOrderId && !p.IsDeleted, cancellationToken);

        if (po is null)
            return Result<bool>.Failure("PO_404_NOT_FOUND", "Purchase order not found.");

        foreach (var a in request.Attachments)
        {
            await _context.GetSet<Novologs.Domain.Entities.PurchaseOrderAttachment>().AddAsync(
                new Novologs.Domain.Entities.PurchaseOrderAttachment
                {
                    PurchaseOrderId = po.Id,
                    FileName        = a.FileName,
                    FileUrl         = a.FileUrl,
                    FilePath        = a.FilePath,
                    MimeType        = a.MimeType,
                    FileSize        = a.FileSize,
                    UploadedAt      = DateTime.UtcNow,
                    UploadedBy      = _user.Id ?? "system"
                }, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
