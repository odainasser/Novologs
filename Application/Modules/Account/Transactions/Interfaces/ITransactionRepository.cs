using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Account.Transactions.Interfaces;

public interface ITransactionRepository
{
    Task<AccountTransaction?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<AccountTransaction>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<int> AddAsync(AccountTransaction transaction, CancellationToken cancellationToken = default);
    Task UpdateAsync(AccountTransaction transaction, CancellationToken cancellationToken = default);
    Task DeleteAsync(AccountTransaction transaction, CancellationToken cancellationToken = default);

    /// <summary>Returns all posted transaction lines for the given account ordered by transaction date.</summary>
    Task<List<(DateTime Date, string? ReferenceNo, string Description, int TransactionId, decimal Debit, decimal Credit)>>
        GetLedgerLinesAsync(Guid accountId, DateTime from, DateTime to, CancellationToken cancellationToken = default);

    /// <summary>Sum of (Debit - Credit) for the account in all posted transactions dated strictly before <paramref name="before"/>.</summary>
    Task<decimal> GetOpeningBalanceAsync(Guid accountId, DateTime before, CancellationToken cancellationToken = default);

    /// <summary>Returns debit and credit totals per leaf account for all posted transactions up to and including <paramref name="asOf"/>.</summary>
    Task<List<(Guid AccountId, string AccountCode, string AccountName, decimal TotalDebit, decimal TotalCredit)>>
        GetTrialBalanceDataAsync(DateTime asOf, CancellationToken cancellationToken = default);
}
