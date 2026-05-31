using System.ComponentModel;
using Novologs.Application.Modules.Account.Transactions.DTOs;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;

namespace Novologs.Application.Modules.Account.Transactions.Queries.GetTransactions;

[Description("Retrieves a paginated, sortable, and searchable list of journal transactions.")]
[AuthorizePermission(Permissions.Accounting.ReadTransaction)]
public record GetTransactionsQuery : IRequest<Result<GetTransactionsQueryResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName (e.g., \"ReferenceNo\", \"Description\", \"CreatedBy\"), " +
        "FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName (e.g., \"Date\", \"ReferenceNo\", \"IsPosted\"), SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }

    [Description("Optional filter: only return transactions on or after this date.")]
    public DateTime? From { get; init; }

    [Description("Optional filter: only return transactions on or before this date.")]
    public DateTime? To { get; init; }

    [Description("Optional filter by posted status.")]
    public bool? IsPosted { get; init; }
}

public class GetTransactionsQueryResponse : FilteredResult<TransactionDto>
{
}

public class GetTransactionsQueryHandler : IRequestHandler<GetTransactionsQuery, Result<GetTransactionsQueryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetTransactionsQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<GetTransactionsQueryResponse>> Handle(GetTransactionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GetSet<Novologs.Domain.Entities.AccountTransaction>()
            .Include(t => t.Lines)
                .ThenInclude(l => l.Account)
                    .ThenInclude(a => a.ParentAccount!)
                        .ThenInclude(p => p.ParentAccount!)
                            .ThenInclude(p => p.ParentAccount!)
                                .ThenInclude(p => p.ParentAccount)
            .Include(t => t.Attachments)
            .AsNoTracking()
            .AsQueryable();

        // Apply fixed filters
        if (request.From.HasValue)
            query = query.Where(t => t.Date >= request.From.Value);

        if (request.To.HasValue)
            query = query.Where(t => t.Date <= request.To.Value);

        if (request.IsPosted.HasValue)
            query = query.Where(t => t.IsPosted == request.IsPosted.Value);

        // Apply dynamic search
        query = query.ApplySearch(request.Search);

        var result = new GetTransactionsQueryResponse
        {
            Total = await query.CountAsync(cancellationToken)
        };

        // Apply sorting (default: Date desc, then Id desc)
        if (request.Sort != null)
            query = query.ApplySorting(request.Sort);
        else
            query = query.OrderByDescending(t => t.Date).ThenByDescending(t => t.Id);

        query = query.ApplyPagination(request.Pagination);

        var transactions = await query.ToListAsync(cancellationToken);

        result.Items = _mapper.Map<List<TransactionDto>>(transactions);
        return Result<GetTransactionsQueryResponse>.Success(result);
    }
}
