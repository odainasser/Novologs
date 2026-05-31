using Novologs.Application.Modules.Account.Transactions.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Transactions.Queries.GetAccountLedger;

[AuthorizePermission(Permissions.Accounting.ReadLedger)]
public record GetAccountLedgerQuery : IRequest<Result<LedgerDto>>
{
    public Guid AccountId { get; init; }
    public DateTime From { get; init; }
    public DateTime To { get; init; }
}

public class GetAccountLedgerQueryHandler : IRequestHandler<GetAccountLedgerQuery, Result<LedgerDto>>
{
    private readonly ITenantDbContext _context;

    public GetAccountLedgerQueryHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LedgerDto>> Handle(GetAccountLedgerQuery request, CancellationToken cancellationToken)
    {
        var account = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .FirstOrDefaultAsync(a => a.Id == request.AccountId && !a.IsDeleted, cancellationToken);

        if (account is null)
            return Result<LedgerDto>.Failure("TXN_404_ACCOUNT", "Account not found.");

        // Opening balance: debit - credit of all posted transactions dated before 'from'
        var openingBalance = await _context.GetSet<Novologs.Domain.Entities.AccountTransactionLine>()
            .Where(l => l.AccountId == request.AccountId
                     && l.Transaction.IsPosted
                     && l.Transaction.Date < request.From)
            .SumAsync(l => l.Debit - l.Credit, cancellationToken);

        // Lines in the requested date range (posted only)
        var lines = await _context.GetSet<Novologs.Domain.Entities.AccountTransactionLine>()
            .Where(l => l.AccountId == request.AccountId
                     && l.Transaction.IsPosted
                     && l.Transaction.Date >= request.From
                     && l.Transaction.Date <= request.To)
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

        var runningBalance = openingBalance;
        var entries = lines.Select(l =>
        {
            runningBalance += l.Debit - l.Credit;
            return new LedgerEntryDto
            {
                TransactionId  = l.TransactionId,
                Date           = l.Date,
                ReferenceNo    = l.ReferenceNo,
                Description    = l.Description,
                Debit          = l.Debit,
                Credit         = l.Credit,
                RunningBalance = runningBalance
            };
        }).ToList();

        var dto = new LedgerDto
        {
            AccountId      = account.Id,
            AccountCode    = account.Code,
            AccountName    = account.Name,
            From           = request.From,
            To             = request.To,
            OpeningBalance = openingBalance,
            ClosingBalance = runningBalance,
            Entries        = entries
        };

        return Result<LedgerDto>.Success(dto);
    }
}
