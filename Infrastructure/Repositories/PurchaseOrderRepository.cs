using Novologs.Application.Modules.Account.PurchaseOrders.Interfaces;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Repositories;

public class PurchaseOrderRepository : IPurchaseOrderRepository
{
    private readonly ITenantDbContext _context;

    public PurchaseOrderRepository(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<PurchaseOrder?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.GetSet<PurchaseOrder>()
            .IgnoreQueryFilters()
            .Include(po => po.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.Name)
                        .ThenInclude(n => n.LocalizedStrings)
            .Include(po => po.Attachments)
            .FirstOrDefaultAsync(po => po.Id == id && !po.IsDeleted, cancellationToken);

    public async Task<int> AddAsync(PurchaseOrder purchaseOrder, CancellationToken cancellationToken = default)
    {
        await _context.GetSet<PurchaseOrder>().AddAsync(purchaseOrder, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return purchaseOrder.Id;
    }

    public async Task UpdateAsync(PurchaseOrder purchaseOrder, CancellationToken cancellationToken = default)
    {
        // Only call Update() for detached entities; tracked entities (loaded via GetByIdAsync
        // in the same context) are already change-tracked and calling Update() on them can
        // interfere with the Deleted state of items cleared from collection navigations.
        var dbContext = (Microsoft.EntityFrameworkCore.DbContext)_context;
        if (dbContext.Entry(purchaseOrder).State == EntityState.Detached)
            _context.GetSet<PurchaseOrder>().Update(purchaseOrder);

        await _context.SaveChangesAsync(cancellationToken);
    }
}
