using System.ComponentModel;
using Novologs.Application.Modules.Account.Products.DTOs;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Products.Queries.GetProductUnits;

[Description("Retrieves a paginated, sortable, and searchable list of product units.")]
public record GetProductUnitsQuery : IRequest<Result<GetProductUnitsQueryResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetProductUnitsQueryResponse : FilteredResult<ProductUnitDto> { }

public class GetProductUnitsQueryHandler : IRequestHandler<GetProductUnitsQuery, Result<GetProductUnitsQueryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetProductUnitsQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<GetProductUnitsQueryResponse>> Handle(GetProductUnitsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GetSet<Novologs.Domain.Entities.ProductUnit>()
            .Include(u => u.Name)
                .ThenInclude(n => n.LocalizedStrings)
            .Where(u => !u.IsDeleted)
            .AsNoTracking()
            .AsQueryable();

        query = query.ApplySearch(request.Search);

        var result = new GetProductUnitsQueryResponse
        {
            Total = await query.CountAsync(cancellationToken)
        };

        if (request.Sort != null)
            query = query.ApplySorting(request.Sort);
        else
            query = query.OrderBy(u => u.Name.Value);

        query = query.ApplyPagination(request.Pagination);

        var items = await query.ToListAsync(cancellationToken);
        result.Items = _mapper.Map<List<ProductUnitDto>>(items);

        return Result<GetProductUnitsQueryResponse>.Success(result);
    }
}
