using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Account.PurchaseInvoices.Interfaces;

public interface IPurchaseInvoiceRepository
{
    Task<PurchaseInvoice?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<int> AddAsync(PurchaseInvoice invoice, CancellationToken cancellationToken = default);
    Task UpdateAsync(PurchaseInvoice invoice, CancellationToken cancellationToken = default);
}
