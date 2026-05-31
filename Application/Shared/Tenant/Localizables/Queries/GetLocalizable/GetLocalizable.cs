using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Localizables.Queries.GetLocalizable;

public record GetLocalizableQuery : IRequest<Result<GetLocalizableResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetLocalizableResponse : FilteredResult<Domain.Entities.LocalizableText>
{
}

public class GetLocalizableQueryValidator : AbstractValidator<GetLocalizableQuery>
{
    public GetLocalizableQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetLocalizableQueryHandler : IRequestHandler<GetLocalizableQuery, Result<GetLocalizableResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetLocalizableQueryHandler(
        ITenantDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetLocalizableResponse>> Handle(GetLocalizableQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetLocalizableResponse();
        var query = _context.GetSet<Domain.Entities.LocalizableText>("LocalizedStrings")
            .AsNoTracking().AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ToListAsync(cancellationToken);
        return Result<GetLocalizableResponse>.Success(result);
    }
}
