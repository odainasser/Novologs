using Novologs.Application.Modules.Account.Products.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Products.Queries.GetProductLookups;
[AuthorizePermission(Permissions.Accounting.ReadProduct)]
public record GetProductLookupsQuery : IRequest<Result<List<ProductLookupDto>>>;

public class GetProductLookupsQueryHandler : IRequestHandler<GetProductLookupsQuery, Result<List<ProductLookupDto>>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetProductLookupsQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<List<ProductLookupDto>>> Handle(GetProductLookupsQuery request, CancellationToken cancellationToken)
    {
        var products = await _context.GetSet<Novologs.Domain.Entities.Product>()
            .Include(p => p.Name)
                .ThenInclude(n => n.LocalizedStrings)
            .Where(p => p.IsActive)
            .OrderBy(p => p.Name.Value)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Result<List<ProductLookupDto>>.Success(_mapper.Map<List<ProductLookupDto>>(products));
    }
}
