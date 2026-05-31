using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.Accounts.Commands.SetOpeningBalance;

public record OpeningBalanceEntry
{
    public Guid AccountId { get; init; }
    public decimal OpeningDebit { get; init; }
    public decimal OpeningCredit { get; init; }
}

[AuthorizePermission(Permissions.Accounting.SetOpeningBalance)]
public record SetOpeningBalanceCommand : IRequest<Result<bool>>
{
    public List<OpeningBalanceEntry> Entries { get; init; } = new();
}

public class SetOpeningBalanceCommandHandler : IRequestHandler<SetOpeningBalanceCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public SetOpeningBalanceCommandHandler(ITenantDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<Result<bool>> Handle(SetOpeningBalanceCommand request, CancellationToken cancellationToken)
    {
        // Validate entries exist
        if (request.Entries == null || !request.Entries.Any())
            return Result<bool>.Failure("OB_400_EMPTY", "At least one opening balance entry is required.");

        // Validate each entry
        foreach (var entry in request.Entries)
        {
            if (entry.OpeningDebit < 0 || entry.OpeningCredit < 0)
                return Result<bool>.Failure("OB_400_NEGATIVE", "Opening balance amounts cannot be negative.");

            if (entry.OpeningDebit > 0 && entry.OpeningCredit > 0)
                return Result<bool>.Failure("OB_400_BOTH", "An account cannot have both a debit and a credit opening balance.");
        }

        // Validate that total debits equal total credits (must tally)
        var totalDebits = request.Entries.Sum(e => e.OpeningDebit);
        var totalCredits = request.Entries.Sum(e => e.OpeningCredit);

        if (totalDebits != totalCredits)
        {
            return Result<bool>.Failure("OB_400_NOT_BALANCED", 
                $"Opening balances do not tally. Total debits ({totalDebits:N2}) must equal total credits ({totalCredits:N2}).");
        }

        // Get all unique account IDs
        var accountIds = request.Entries.Select(e => e.AccountId).Distinct().ToList();

        // Fetch all accounts at once
        var accounts = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .Where(a => accountIds.Contains(a.Id) && !a.IsDeleted)
            .ToListAsync(cancellationToken);

        // Verify all accounts exist
        if (accounts.Count != accountIds.Count)
        {
            var missingIds = accountIds.Except(accounts.Select(a => a.Id));
            return Result<bool>.Failure("OB_404_ACCOUNT", $"Account(s) not found: {string.Join(", ", missingIds)}");
        }

        // Find or create "Opening Balance Equity" account
        var openingBalanceEquityAccount = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .FirstOrDefaultAsync(a => a.Code == "3200" && !a.IsDeleted, cancellationToken);

        if (openingBalanceEquityAccount is null)
        {
            // Create the Opening Balance Equity account
            var equityParent = await _context.GetSet<Novologs.Domain.Entities.Account>()
                .FirstOrDefaultAsync(a => a.Code == "3000" && a.AccountType == AccountType.Equity && !a.IsDeleted, cancellationToken);

            openingBalanceEquityAccount = new Novologs.Domain.Entities.Account(Guid.NewGuid())
            {
                Code = "3200",
                Name = "Opening Balance Equity",
                AccountType = AccountType.Equity,
                AccountCategory = AccountCategory.OwnersEquity,
                Level = 2,
                ParentAccountId = equityParent?.Id,
                IsActive = true
            };

            await _context.GetSet<Novologs.Domain.Entities.Account>().AddAsync(openingBalanceEquityAccount, cancellationToken);
        }

        // Process each account entry
        foreach (var entry in request.Entries)
        {
            var account = accounts.First(a => a.Id == entry.AccountId);

            // Delete any existing opening balance transactions for this account
            var existingOpeningBalancePattern = $"OB-{account.Code}-";
            var existingTransactions = await _context.GetSet<Novologs.Domain.Entities.AccountTransaction>()
                .Include(t => t.Lines)
                .Where(t => t.ReferenceNo != null && t.ReferenceNo.StartsWith(existingOpeningBalancePattern))
                .ToListAsync(cancellationToken);

            if (existingTransactions.Any())
            {
                // Delete transaction lines first
                foreach (var existingTx in existingTransactions)
                {
                    _context.GetSet<Novologs.Domain.Entities.AccountTransactionLine>().RemoveRange(existingTx.Lines);
                }
                // Then delete the transactions
                _context.GetSet<Novologs.Domain.Entities.AccountTransaction>().RemoveRange(existingTransactions);
            }

            // Update the account's opening balance (for fast display)
            account.OpeningDebit = entry.OpeningDebit;
            account.OpeningCredit = entry.OpeningCredit;

            // Skip creating transaction if both are zero
            if (entry.OpeningDebit == 0 && entry.OpeningCredit == 0)
                continue;

            // Create a transaction with two lines for double-entry bookkeeping
            var transactionDate = DateTime.UtcNow.Date;
            var referenceNo = $"OB-{account.Code}-{DateTime.UtcNow:yyyyMMddHHmmss}";
            var description = $"Opening balance for {account.Code} - {account.Name}";

            var transaction = new Novologs.Domain.Entities.AccountTransaction
            {
                Date = transactionDate,
                ReferenceNo = referenceNo,
                Description = description,
                IsPosted = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _user.Id ?? "system",
                Lines = new List<Novologs.Domain.Entities.AccountTransactionLine>()
            };

            // Create two transaction lines based on whether it's a debit or credit opening balance
            if (entry.OpeningDebit > 0)
            {
                // Debit to the account
                transaction.Lines.Add(new Novologs.Domain.Entities.AccountTransactionLine
                {
                    AccountId = account.Id,
                    Debit = entry.OpeningDebit,
                    Credit = 0,
                    Description = description
                });

                // Credit to Opening Balance Equity
                transaction.Lines.Add(new Novologs.Domain.Entities.AccountTransactionLine
                {
                    AccountId = openingBalanceEquityAccount.Id,
                    Debit = 0,
                    Credit = entry.OpeningDebit,
                    Description = description
                });
            }
            else if (entry.OpeningCredit > 0)
            {
                // Credit to the account
                transaction.Lines.Add(new Novologs.Domain.Entities.AccountTransactionLine
                {
                    AccountId = account.Id,
                    Debit = 0,
                    Credit = entry.OpeningCredit,
                    Description = description
                });

                // Debit to Opening Balance Equity
                transaction.Lines.Add(new Novologs.Domain.Entities.AccountTransactionLine
                {
                    AccountId = openingBalanceEquityAccount.Id,
                    Debit = entry.OpeningCredit,
                    Credit = 0,
                    Description = description
                });
            }

            await _context.GetSet<Novologs.Domain.Entities.AccountTransaction>().AddAsync(transaction, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
