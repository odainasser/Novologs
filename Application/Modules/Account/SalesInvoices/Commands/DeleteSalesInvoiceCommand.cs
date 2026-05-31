using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.SalesInvoices.Commands.DeleteSalesInvoice;

[AuthorizePermission(Permissions.Accounting.DeleteSalesInvoice)]
public record DeleteSalesInvoiceCommand(int Id) : IRequest<Result<bool>>;

public class DeleteSalesInvoiceCommandHandler : IRequestHandler<DeleteSalesInvoiceCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;

    public DeleteSalesInvoiceCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteSalesInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _context.GetSet<Novologs.Domain.Entities.SalesInvoice>()
            .FirstOrDefaultAsync(i => i.Id == request.Id && !i.IsDeleted, cancellationToken);

        if (invoice is null)
            return Result<bool>.Failure("SINV_404_NOT_FOUND", $"Sales invoice with ID {request.Id} was not found.");

        if (invoice.Status != Novologs.Domain.Enums.SalesInvoiceStatus.Draft)
            return Result<bool>.Failure("SINV_409_NOT_DRAFT", "Only Draft sales invoices can be deleted.");

        invoice.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
