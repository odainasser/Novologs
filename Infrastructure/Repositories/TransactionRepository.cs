using Novologs.Application.Modules.Account.Transactions.Interfaces;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly ITenantDbContext _context;

    public TransactionRepository(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<AccountTransaction?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.GetSet<AccountTransaction>()
            .Include(t => t.Lines)
                .ThenInclude(l => l.Account)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    public async Task<List<AccountTransaction>> GetAllAsync(CancellationToken cancellationToken = default)
        => await _context.GetSet<AccountTransaction>()
            .Include(t => t.Lines)
                .ThenInclude(l => l.Account)
            .OrderByDescending(t => t.Date)
            .ToListAsync(cancellationToken);

    public async Task<int> AddAsync(AccountTransaction transaction, CancellationToken cancellationToken = default)
    {
        await _context.GetSet<AccountTransaction>().AddAsync(transaction, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return transaction.Id;
    }

    public async Task UpdateAsync(AccountTransaction transaction, CancellationToken cancellationToken = default)
    {
        _context.GetSet<AccountTransaction>().Update(transaction);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(AccountTransaction transaction, CancellationToken cancellationToken = default)
    {
        _context.GetSet<AccountTransactionLine>().RemoveRange(transaction.Lines);
        _context.GetSet<AccountTransaction>().Remove(transaction);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<(DateTime Date, string? ReferenceNo, string Description, int TransactionId, decimal Debit, decimal Credit)>>
        GetLedgerLinesAsync(Guid accountId, DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        var rows = await _context.GetSet<AccountTransactionLine>()
            .Where(l => l.AccountId == accountId
                     && l.Transaction.IsPosted
                     && l.Transaction.Date >= from
                     && l.Transaction.Date <= to)
            .Select(l => new
            {
                l.Transaction.Date,
                l.Transaction.ReferenceNo,
                l.Transaction.Description,
                TransactionId = l.Transaction.Id,
                l.Debit,
                l.Credit
            })
            .OrderBy(l => l.Date)
            .ThenBy(l => l.TransactionId)
            .ToListAsync(cancellationToken);

        return rows.Select(r => (r.Date, r.ReferenceNo, r.Description, r.TransactionId, r.Debit, r.Credit)).ToList();
    }

    public async Task<decimal> GetOpeningBalanceAsync(Guid accountId, DateTime before, CancellationToken cancellationToken = default)
        => await _context.GetSet<AccountTransactionLine>()
            .Where(l => l.AccountId == accountId
                     && l.Transaction.IsPosted
                     && l.Transaction.Date < before)
            .SumAsync(l => l.Debit - l.Credit, cancellationToken);

    public async Task<List<(Guid AccountId, string AccountCode, string AccountName, decimal TotalDebit, decimal TotalCredit)>>
        GetTrialBalanceDataAsync(DateTime asOf, CancellationToken cancellationToken = default)
    {
        var rows = await _context.GetSet<AccountTransactionLine>()
            .Where(l => l.Transaction.IsPosted && l.Transaction.Date <= asOf)
            .GroupBy(l => new { l.AccountId, l.Account.Code, l.Account.Name })
            .Select(g => new
            {
                g.Key.AccountId,
                g.Key.Code,
                g.Key.Name,
                TotalDebit  = g.Sum(l => l.Debit),
                TotalCredit = g.Sum(l => l.Credit)
            })
            .OrderBy(r => r.Code)
            .ToListAsync(cancellationToken);

        return rows.Select(r => (r.AccountId, r.Code, r.Name, r.TotalDebit, r.TotalCredit)).ToList();
    }
}
