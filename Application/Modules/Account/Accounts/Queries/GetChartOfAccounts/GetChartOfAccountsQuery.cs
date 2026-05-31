using Novologs.Application.Modules.Account.Accounts.DTOs;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Account.Accounts.Queries.GetChartOfAccounts;

[AuthorizePermission(Permissions.Accounting.ReadAccount)]
public record GetChartOfAccountsQuery : IRequest<Result<List<ChartOfAccountsDto>>>;

public class GetChartOfAccountsQueryHandler : IRequestHandler<GetChartOfAccountsQuery, Result<List<ChartOfAccountsDto>>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetChartOfAccountsQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<List<ChartOfAccountsDto>>> Handle(GetChartOfAccountsQuery request, CancellationToken cancellationToken)
    {
        // Get all root accounts (Level 1) with their 5-level hierarchy
        var accounts = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .Where(a => !a.IsDeleted && a.Level == 1)
            .Include(a => a.ChildAccounts.Where(c => !c.IsDeleted).OrderBy(c => c.Code.Length).ThenBy(c => c.Code))
                .ThenInclude(c => c.ChildAccounts.Where(cc => !cc.IsDeleted).OrderBy(cc => cc.Code.Length).ThenBy(cc => cc.Code))
                    .ThenInclude(cc => cc.ChildAccounts.Where(ccc => !ccc.IsDeleted).OrderBy(ccc => ccc.Code.Length).ThenBy(ccc => ccc.Code))
                        .ThenInclude(ccc => ccc.ChildAccounts.Where(cccc => !cccc.IsDeleted).OrderBy(cccc => cccc.Code.Length).ThenBy(cccc => cccc.Code))
            .OrderBy(a => a.Code.Length).ThenBy(a => a.Code)
            .ToListAsync(cancellationToken);

        // Compute total debit/credit per account from all posted transaction lines
        var txTotals = await _context.GetSet<Novologs.Domain.Entities.AccountTransactionLine>()
            .Where(l => l.Transaction.IsPosted)
            .GroupBy(l => l.AccountId)
            .Select(g => new { AccountId = g.Key, Debit = g.Sum(l => l.Debit), Credit = g.Sum(l => l.Credit) })
            .ToDictionaryAsync(x => x.AccountId, x => (x.Debit, x.Credit), cancellationToken);

        var result = _mapper.Map<List<ChartOfAccountsDto>>(accounts);

        // Add posted tx amounts to each node then roll children up to parents (post-order)
        foreach (var node in result)
            ApplyTotals(node, txTotals);

        return Result<List<ChartOfAccountsDto>>.Success(result);
    }

    private static void ApplyTotals(ChartOfAccountsDto node, Dictionary<Guid, (decimal Debit, decimal Credit)> txTotals)
    {
        // Recurse into children first (post-order so children are settled before parent rolls them up)
        foreach (var child in node.Children)
            ApplyTotals(child, txTotals);

        // TotalDebit/TotalCredit = posted transaction lines for this account only
        if (txTotals.TryGetValue(node.Id, out var tx))
        {
            node.TotalDebit  = tx.Debit;
            node.TotalCredit = tx.Credit;
        }
        else
        {
            node.TotalDebit  = 0;
            node.TotalCredit = 0;
        }

        // OpeningDebit/OpeningCredit = stored entity fields (set via SetOpeningBalance) â€” already mapped by AutoMapper

        // Roll up all children into this parent
        node.TotalDebit   += node.Children.Sum(c => c.TotalDebit);
        node.TotalCredit  += node.Children.Sum(c => c.TotalCredit);
        node.OpeningDebit  += node.Children.Sum(c => c.OpeningDebit);
        node.OpeningCredit += node.Children.Sum(c => c.OpeningCredit);
    }
}
