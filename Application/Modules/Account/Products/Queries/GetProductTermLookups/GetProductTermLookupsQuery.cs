using Novologs.Application.Modules.Account.Products.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Products.Queries.GetProductTermLookups;

public record GetProductTermLookupsQuery : IRequest<Result<List<ProductTermDto>>>;

public class GetProductTermLookupsQueryHandler : IRequestHandler<GetProductTermLookupsQuery, Result<List<ProductTermDto>>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetProductTermLookupsQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<List<ProductTermDto>>> Handle(GetProductTermLookupsQuery request, CancellationToken cancellationToken)
    {
        var terms = await _context.GetSet<Novologs.Domain.Entities.ProductTerm>()
            .Include(t => t.Name)
                .ThenInclude(n => n.LocalizedStrings)
            .Where(t => !t.IsDeleted)
            .OrderBy(t => t.Name.Value)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Result<List<ProductTermDto>>.Success(_mapper.Map<List<ProductTermDto>>(terms));
    }
}
