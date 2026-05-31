using System.ComponentModel;
using Novologs.Application.Modules.Account.Products.DTOs;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Products.Queries.GetProducts;

[Description("Retrieves a paginated, sortable, and searchable list of products.")]
public record GetProductsQuery : IRequest<Result<GetProductsQueryResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
    public bool? IsActive { get; init; }
}

public class GetProductsQueryResponse : FilteredResult<ProductDto> { }

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, Result<GetProductsQueryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetProductsQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<GetProductsQueryResponse>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GetSet<Novologs.Domain.Entities.Product>()
            .Include(p => p.Name)
                .ThenInclude(n => n.LocalizedStrings)
            .AsNoTracking()
            .AsSplitQuery()
            .AsQueryable();

        if (request.IsActive.HasValue)
            query = query.Where(p => p.IsActive == request.IsActive.Value);

        query = query.ApplySearch(request.Search);

        var result = new GetProductsQueryResponse
        {
            Total = await query.CountAsync(cancellationToken)
        };

        if (request.Sort != null)
            query = query.ApplySorting(request.Sort);
        else
            query = query.OrderBy(p => p.Name.Value);

        query = query.ApplyPagination(request.Pagination);

        var items = await query.ToListAsync(cancellationToken);
        result.Items = _mapper.Map<List<ProductDto>>(items);

        return Result<GetProductsQueryResponse>.Success(result);
    }
}
