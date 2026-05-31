using System.ComponentModel;
using Novologs.Application.Modules.Account.InvoiceDefaultAccounts.DTOs;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.InvoiceDefaultAccounts.Queries.GetInvoiceDefaultAccounts;

[AuthorizePermission(Permissions.Accounting.ReadInvoiceDefaultAccount)]
[Description("Retrieves a paginated, sortable, and searchable list of invoice default account mappings.")]
public record GetInvoiceDefaultAccountsQuery : IRequest<Result<GetInvoiceDefaultAccountsQueryResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetInvoiceDefaultAccountsQueryResponse : FilteredResult<InvoiceDefaultAccountDto> { }

public class GetInvoiceDefaultAccountsQueryHandler : IRequestHandler<GetInvoiceDefaultAccountsQuery, Result<GetInvoiceDefaultAccountsQueryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetInvoiceDefaultAccountsQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<GetInvoiceDefaultAccountsQueryResponse>> Handle(GetInvoiceDefaultAccountsQuery request, CancellationToken cancellationToken)
    {

        var query = _context.GetSet<Novologs.Domain.Entities.InvoiceDefaultAccount>()
            .Include(x => x.Account)
            .Where(x => !x.IsDeleted)
            .AsNoTracking()
            .AsQueryable();

        query = query.ApplySearch(request.Search);

        var result = new GetInvoiceDefaultAccountsQueryResponse
        {
            Total = await query.CountAsync(cancellationToken)
        };

        if (request.Sort != null)
            query = query.ApplySorting(request.Sort);
        else
            query = query.OrderBy(x => x.InvoiceCategory);

        query = query.ApplyPagination(request.Pagination);

        var items = await query.ToListAsync(cancellationToken);
        result.Items = _mapper.Map<List<InvoiceDefaultAccountDto>>(items);

        return Result<GetInvoiceDefaultAccountsQueryResponse>.Success(result);
    }
}
