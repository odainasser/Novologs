using System.ComponentModel;
using Novologs.Application.Modules.Account.Accounts.DTOs;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.Accounts.Queries.GetChartOfAccountsList;
[AuthorizePermission(Permissions.Accounting.ReadAccount)]
[Description("Retrieves a flat, paginated list of chart-of-accounts entries with sorting and filtering options.")]
public record GetChartOfAccountsListQuery : IRequest<Result<GetChartOfAccountsListQueryResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName (e.g., \"Code\", \"Name\", \"AccountType\", \"AccountCategory\", \"Level\", \"IsActive\"), " +
        "FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName, SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }

    [Description("Optional filter by AccountType.")]
    public AccountType? AccountType { get; init; }

    [Description("Optional filter by AccountCategory.")]
    public AccountCategory? AccountCategory { get; init; }

    [Description("Optional filter by IsActive status.")]
    public bool? IsActive { get; init; }
}

public class GetChartOfAccountsListQueryResponse : FilteredResult<ChartOfAccountsListItemDto>
{
}

public class GetChartOfAccountsListQueryHandler
    : IRequestHandler<GetChartOfAccountsListQuery, Result<GetChartOfAccountsListQueryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetChartOfAccountsListQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetChartOfAccountsListQueryResponse>> Handle(
        GetChartOfAccountsListQuery request,
        CancellationToken cancellationToken)
    {
        // Collect all IDs that are parents so we can flag HasChildren correctly
        var parentIds = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .Where(a => !a.IsDeleted && a.ParentAccountId.HasValue)
            .Select(a => a.ParentAccountId!.Value)
            .ToHashSetAsync(cancellationToken);

        var query = _context.GetSet<Novologs.Domain.Entities.Account>()
            .Where(a => !a.IsDeleted)
            .Include(a => a.ParentAccount)
                .ThenInclude(p => p!.ParentAccount)
                    .ThenInclude(pp => pp!.ParentAccount)
                        .ThenInclude(ppp => ppp!.ParentAccount)
            .AsNoTracking();

        // Optional filters
        if (request.AccountType.HasValue)
            query = query.Where(a => a.AccountType == request.AccountType.Value);

        if (request.AccountCategory.HasValue)
            query = query.Where(a => a.AccountCategory == request.AccountCategory.Value);

        if (request.IsActive.HasValue)
            query = query.Where(a => a.IsActive == request.IsActive.Value);

        // Apply dynamic search
        query = query.ApplySearch(request.Search);

        // Only return leaf accounts (no children)
        query = query.Where(a => !parentIds.Contains(a.Id));

        // Exclude subcategory accounts
        query = query.Where(a => !a.IsSubcategory);

        var result = new GetChartOfAccountsListQueryResponse
        {
            Total = await query.CountAsync(cancellationToken)
        };

        // Apply sorting (default: Code asc)
        if (request.Sort != null)
            query = query.ApplySorting(request.Sort);
        else
            query = query.OrderBy(a => a.Code.Length).ThenBy(a => a.Code);

        query = query.ApplyPagination(request.Pagination);

        var accounts = await query.ToListAsync(cancellationToken);

        // Load posted transaction totals for the accounts in this page
        var accountIds = accounts.Select(a => a.Id).ToHashSet();
        var txTotals = await _context.GetSet<Novologs.Domain.Entities.AccountTransactionLine>()
            .Where(l => l.Transaction.IsPosted && accountIds.Contains(l.AccountId))
            .GroupBy(l => l.AccountId)
            .Select(g => new { AccountId = g.Key, Debit = g.Sum(l => l.Debit), Credit = g.Sum(l => l.Credit) })
            .ToDictionaryAsync(x => x.AccountId, x => (x.Debit, x.Credit), cancellationToken);

        var dtos = _mapper.Map<List<ChartOfAccountsListItemDto>>(accounts);

        // Build FullPath and per-level names for each item
        foreach (var (dto, entity) in dtos.Zip(accounts))
        {
            var levelNames = BuildLevelNames(entity);
            dto.FullPath = string.Join(" / ", levelNames.Where(n => n != null));
            dto.Level1Name = levelNames.Count > 0 ? levelNames[0] : null;
            dto.Level2Name = levelNames.Count > 1 ? levelNames[1] : null;
            dto.Level3Name = levelNames.Count > 2 ? levelNames[2] : null;
            dto.Level4Name = levelNames.Count > 3 ? levelNames[3] : null;
            dto.Level5Name = levelNames.Count > 4 ? levelNames[4] : null;
            dto.HasChildren = parentIds.Contains(entity.Id);

            if (txTotals.TryGetValue(entity.Id, out var tx))
            {
                dto.TotalDebit  = tx.Debit;
                dto.TotalCredit = tx.Credit;
            }
            else
            {
                dto.TotalDebit  = 0;
                dto.TotalCredit = 0;
            }

            dto.TotalValue = dto.TotalDebit - dto.TotalCredit;
        }

        result.Items = dtos;
        return Result<GetChartOfAccountsListQueryResponse>.Success(result);
    }

    /// <summary>
    /// Walks up the parent chain and returns the names ordered from root (Level 1) down to the account itself.
    /// Supports up to 5 levels as defined by the chart-of-accounts hierarchy.
    /// </summary>
    private static List<string?> BuildLevelNames(Novologs.Domain.Entities.Account account)
    {
        var parts = new List<string?> { account.Name };
        var current = account.ParentAccount;
        while (current != null)
        {
            parts.Insert(0, current.Name);
            current = current.ParentAccount;
        }

        // Pad to 5 slots so callers can always index [0]â€“[4] safely
        while (parts.Count < 5)
            parts.Add(null);

        return parts;
    }
}
