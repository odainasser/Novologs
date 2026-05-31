using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.PurchaseInvoices.Commands.DeletePurchaseInvoice;


[AuthorizePermission(Permissions.Accounting.DeletePurchaseInvoice)]
public record DeletePurchaseInvoiceCommand(int Id) : IRequest<Result<bool>>;

public class DeletePurchaseInvoiceCommandHandler : IRequestHandler<DeletePurchaseInvoiceCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;

    public DeletePurchaseInvoiceCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeletePurchaseInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _context.GetSet<Novologs.Domain.Entities.PurchaseInvoice>()
            .FirstOrDefaultAsync(i => i.Id == request.Id && !i.IsDeleted, cancellationToken);

        if (invoice is null)
            return Result<bool>.Failure("INV_404_NOT_FOUND", $"Purchase invoice with ID {request.Id} was not found.");

        if (invoice.Status != Novologs.Domain.Enums.PurchaseInvoiceStatus.Draft)
            return Result<bool>.Failure("INV_409_NOT_DRAFT", "Only Draft purchase invoices can be deleted.");

        invoice.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
