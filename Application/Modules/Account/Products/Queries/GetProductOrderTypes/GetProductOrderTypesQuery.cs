using System.ComponentModel;
using Novologs.Application.Modules.Account.Products.DTOs;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Products.Queries.GetProductOrderTypes;

[Description("Retrieves a paginated, sortable, and searchable list of product order types.")]
public record GetProductOrderTypesQuery : IRequest<Result<GetProductOrderTypesQueryResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetProductOrderTypesQueryResponse : FilteredResult<ProductOrderTypeDto> { }

public class GetProductOrderTypesQueryHandler : IRequestHandler<GetProductOrderTypesQuery, Result<GetProductOrderTypesQueryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetProductOrderTypesQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<GetProductOrderTypesQueryResponse>> Handle(GetProductOrderTypesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GetSet<Novologs.Domain.Entities.ProductOrderType>()
            .Include(o => o.Name)
                .ThenInclude(n => n.LocalizedStrings)
            .Where(o => !o.IsDeleted)
            .AsNoTracking()
            .AsQueryable();

        query = query.ApplySearch(request.Search);

        var result = new GetProductOrderTypesQueryResponse
        {
            Total = await query.CountAsync(cancellationToken)
        };

        if (request.Sort != null)
            query = query.ApplySorting(request.Sort);
        else
            query = query.OrderBy(o => o.Name.Value);

        query = query.ApplyPagination(request.Pagination);

        var items = await query.ToListAsync(cancellationToken);
        result.Items = _mapper.Map<List<ProductOrderTypeDto>>(items);

        return Result<GetProductOrderTypesQueryResponse>.Success(result);
    }
}
