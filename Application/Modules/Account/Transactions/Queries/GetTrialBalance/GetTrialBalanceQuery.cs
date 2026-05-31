using Novologs.Application.Modules.Account.Transactions.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Transactions.Queries.GetTrialBalance;

[AuthorizePermission(Permissions.Accounting.ReadTrialBalance)]
public record GetTrialBalanceQuery : IRequest<Result<TrialBalanceDto>>
{
    public DateTime AsOf { get; init; }
}

public class GetTrialBalanceQueryHandler : IRequestHandler<GetTrialBalanceQuery, Result<TrialBalanceDto>>
{
    private readonly ITenantDbContext _context;

    public GetTrialBalanceQueryHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TrialBalanceDto>> Handle(GetTrialBalanceQuery request, CancellationToken cancellationToken)
    {
        // Aggregate posted transaction lines up to and including AsOf date, grouped by account
        var rows = await _context.GetSet<Novologs.Domain.Entities.AccountTransactionLine>()
            .Where(l => l.Transaction.IsPosted && l.Transaction.Date <= request.AsOf)
            .GroupBy(l => new { l.AccountId, l.Account.Code, l.Account.Name })
            .Select(g => new TrialBalanceItemDto
            {
                AccountId   = g.Key.AccountId,
                AccountCode = g.Key.Code,
                AccountName = g.Key.Name,
                DebitTotal  = g.Sum(l => l.Debit),
                CreditTotal = g.Sum(l => l.Credit)
            })
            .OrderBy(r => r.AccountCode)
            .ToListAsync(cancellationToken);

        var dto = new TrialBalanceDto
        {
            AsOf        = request.AsOf,
            Items       = rows,
            TotalDebit  = rows.Sum(r => r.DebitTotal),
            TotalCredit = rows.Sum(r => r.CreditTotal)
        };

        return Result<TrialBalanceDto>.Success(dto);
    }
}
