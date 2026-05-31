using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Currencys.Dto;

namespace Novologs.Application.Currencys.Queries.GetCurrency;

public record GetCurrencyQuery : IRequest<Result<GetCurrencyResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetCurrencyResponse : FilteredResult<CurrencyDto>
{
}

public class GetCurrencyQueryValidator : AbstractValidator<GetCurrencyQuery>
{
    public GetCurrencyQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetCurrencyQueryHandler : IRequestHandler<GetCurrencyQuery, Result<GetCurrencyResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetCurrencyQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetCurrencyResponse>> Handle(GetCurrencyQuery request, CancellationToken cancellationToken)
    {
        var result = new GetCurrencyResponse();
        var query = _context.GetSet<Domain.Entities.Currency>("Name.LocalizedStrings")
            .AsNoTracking().AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<CurrencyDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetCurrencyResponse>.Success(result);
    }
}
