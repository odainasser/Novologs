using System.ComponentModel;
using Novologs.Application.Modules.Account.Products.DTOs;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Products.Queries.GetProductTerms;

[Description("Retrieves a paginated, sortable, and searchable list of product terms.")]
public record GetProductTermsQuery : IRequest<Result<GetProductTermsQueryResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetProductTermsQueryResponse : FilteredResult<ProductTermDto> { }

public class GetProductTermsQueryHandler : IRequestHandler<GetProductTermsQuery, Result<GetProductTermsQueryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetProductTermsQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<GetProductTermsQueryResponse>> Handle(GetProductTermsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GetSet<Novologs.Domain.Entities.ProductTerm>()
            .Include(t => t.Name)
                .ThenInclude(n => n.LocalizedStrings)
            .Where(t => !t.IsDeleted)
            .AsNoTracking()
            .AsQueryable();

        query = query.ApplySearch(request.Search);

        var result = new GetProductTermsQueryResponse
        {
            Total = await query.CountAsync(cancellationToken)
        };

        if (request.Sort != null)
            query = query.ApplySorting(request.Sort);
        else
            query = query.OrderBy(t => t.Name.Value);

        query = query.ApplyPagination(request.Pagination);

        var items = await query.ToListAsync(cancellationToken);
        result.Items = _mapper.Map<List<ProductTermDto>>(items);

        return Result<GetProductTermsQueryResponse>.Success(result);
    }
}
