using Novologs.Application.Modules.Account.Products.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Products.Queries.GetProductUnitLookups;

public record GetProductUnitLookupsQuery : IRequest<Result<List<ProductUnitDto>>>;

public class GetProductUnitLookupsQueryHandler : IRequestHandler<GetProductUnitLookupsQuery, Result<List<ProductUnitDto>>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetProductUnitLookupsQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<List<ProductUnitDto>>> Handle(GetProductUnitLookupsQuery request, CancellationToken cancellationToken)
    {
        var units = await _context.GetSet<Novologs.Domain.Entities.ProductUnit>()
            .Include(u => u.Name)
                .ThenInclude(n => n.LocalizedStrings)
            .Where(u => !u.IsDeleted)
            .OrderBy(u => u.Name.Value)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Result<List<ProductUnitDto>>.Success(_mapper.Map<List<ProductUnitDto>>(units));
    }
}
