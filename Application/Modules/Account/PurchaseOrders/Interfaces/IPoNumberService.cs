namespace Novologs.Application.Modules.Account.PurchaseOrders.Interfaces;

public interface IPoNumberService
{
    /// <summary>
    /// Atomically generates the next unique PO number (e.g. "PO-0001") using a
    /// PostgreSQL sequence. Guaranteed race-condition-free even under concurrent requests.
    /// </summary>
    Task<string> GeneratePoNumberAsync(CancellationToken cancellationToken = default);
}
