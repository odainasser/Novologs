using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Account.PurchaseOrders.Interfaces;

public interface IPurchaseOrderRepository
{
    Task<PurchaseOrder?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<int> AddAsync(PurchaseOrder purchaseOrder, CancellationToken cancellationToken = default);
    Task UpdateAsync(PurchaseOrder purchaseOrder, CancellationToken cancellationToken = default);
}
