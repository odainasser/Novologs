using Novologs.Application.Modules.Account.Products.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Products.Queries.GetProductOrderTypeLookups;

public record GetProductOrderTypeLookupsQuery : IRequest<Result<List<ProductOrderTypeDto>>>;

public class GetProductOrderTypeLookupsQueryHandler : IRequestHandler<GetProductOrderTypeLookupsQuery, Result<List<ProductOrderTypeDto>>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetProductOrderTypeLookupsQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<List<ProductOrderTypeDto>>> Handle(GetProductOrderTypeLookupsQuery request, CancellationToken cancellationToken)
    {
        var orderTypes = await _context.GetSet<Novologs.Domain.Entities.ProductOrderType>()
            .Include(o => o.Name)
                .ThenInclude(n => n.LocalizedStrings)
            .Where(o => !o.IsDeleted)
            .OrderBy(o => o.Name.Value)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Result<List<ProductOrderTypeDto>>.Success(_mapper.Map<List<ProductOrderTypeDto>>(orderTypes));
    }
}
