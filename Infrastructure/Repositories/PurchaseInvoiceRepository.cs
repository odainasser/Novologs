using System.Text.RegularExpressions;
using Novologs.Application.Modules.Account.PurchaseInvoices.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Repositories;

public class PurchaseInvoiceRepository : IPurchaseInvoiceRepository
{
    private readonly ITenantDbContext _context;

    public PurchaseInvoiceRepository(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<PurchaseInvoice?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.GetSet<PurchaseInvoice>()
            .Include(inv => inv.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.Name)
                        .ThenInclude(n => n.LocalizedStrings)
            .Include(inv => inv.Attachments)
            .FirstOrDefaultAsync(inv => inv.Id == id && !inv.IsDeleted, cancellationToken);

    public async Task<int> AddAsync(PurchaseInvoice invoice, CancellationToken cancellationToken = default)
    {
        const int maxRetries = 5;
        for (var attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                // If this is a retry, add the entity again with the new invoice number
                if (attempt == 0)
                {
                    await _context.GetSet<PurchaseInvoice>().AddAsync(invoice, cancellationToken);
                }
                else
                {
                    // Detach and re-add the entity with the new invoice number
                    // Cast to DbContext to access Entry method
                    if (_context is DbContext dbContext)
                    {
                        dbContext.Entry(invoice).State = EntityState.Detached;
                    }
                    await _context.GetSet<PurchaseInvoice>().AddAsync(invoice, cancellationToken);
                }

                await _context.SaveChangesAsync(cancellationToken);
                return invoice.Id;
            }
            catch (DbUpdateException ex)
                when (attempt < maxRetries - 1 &&
                      ex.InnerException is PostgresException { SqlState: "23505", ConstraintName: "IX_PurchaseInvoices_InvNumber" })
            {
                // Race condition: another request saved the same number concurrently; regenerate and retry
                invoice.InvNumber = await GenerateNextInvNumberAsync(cancellationToken);
            }
        }

        throw new InvalidOperationException("Failed to generate a unique purchase invoice number after multiple retries.");
    }

    private async Task<string> GenerateNextInvNumberAsync(CancellationToken cancellationToken)
    {
        const string prefix = "INV-";
        var rx = new Regex(@"^INV-(\d+)$");

        var existing = await _context.GetSet<PurchaseInvoice>()
            .Where(inv => EF.Functions.Like(inv.InvNumber, prefix + "%"))
            .Select(inv => inv.InvNumber)
            .ToListAsync(cancellationToken);

        var maxSeq = 0;
        foreach (var num in existing)
        {
            var m = rx.Match(num);
            if (m.Success && int.TryParse(m.Groups[1].Value, out var v))
                maxSeq = Math.Max(maxSeq, v);
        }

        return $"{prefix}{(maxSeq + 1).ToString().PadLeft(4, '0')}";
    }

    public async Task UpdateAsync(PurchaseInvoice invoice, CancellationToken cancellationToken = default)
    {
        _context.GetSet<PurchaseInvoice>().Update(invoice);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
