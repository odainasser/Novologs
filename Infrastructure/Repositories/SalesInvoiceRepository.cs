using System.Text.RegularExpressions;
using Novologs.Application.Modules.Account.SalesInvoices.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Repositories;

public class SalesInvoiceRepository : ISalesInvoiceRepository
{
    private readonly ITenantDbContext _context;

    public SalesInvoiceRepository(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<SalesInvoice?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.GetSet<SalesInvoice>()
            .Include(inv => inv.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.Name)
                        .ThenInclude(n => n.LocalizedStrings)
            .Include(inv => inv.Attachments)
            .FirstOrDefaultAsync(inv => inv.Id == id && !inv.IsDeleted, cancellationToken);

    public async Task<int> AddAsync(SalesInvoice invoice, CancellationToken cancellationToken = default)
    {
        await _context.GetSet<SalesInvoice>().AddAsync(invoice, cancellationToken);

        const int maxRetries = 5;
        for (var attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                await _context.SaveChangesAsync(cancellationToken);
                return invoice.Id;
            }
            catch (DbUpdateException ex)
                when (attempt < maxRetries - 1 &&
                      ex.InnerException is PostgresException { SqlState: "23505", ConstraintName: "IX_SalesInvoices_InvNumber" })
            {
                // Race condition: another request saved the same number concurrently; regenerate and retry
                invoice.InvNumber = await GenerateNextInvNumberAsync(cancellationToken);
            }
        }

        throw new InvalidOperationException("Failed to generate a unique sales invoice number after multiple retries.");
    }

    private async Task<string> GenerateNextInvNumberAsync(CancellationToken cancellationToken)
    {
        const string prefix = "SINV-";
        var rx = new Regex(@"^SINV-(\d+)$");

        var existing = await _context.GetSet<SalesInvoice>()
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

    public async Task UpdateAsync(SalesInvoice invoice, CancellationToken cancellationToken = default)
    {
        _context.GetSet<SalesInvoice>().Update(invoice);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
