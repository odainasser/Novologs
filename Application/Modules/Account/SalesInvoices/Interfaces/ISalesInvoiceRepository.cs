using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Account.SalesInvoices.Interfaces;

public interface ISalesInvoiceRepository
{
    Task<SalesInvoice?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<int> AddAsync(SalesInvoice invoice, CancellationToken cancellationToken = default);
    Task UpdateAsync(SalesInvoice invoice, CancellationToken cancellationToken = default);
}
