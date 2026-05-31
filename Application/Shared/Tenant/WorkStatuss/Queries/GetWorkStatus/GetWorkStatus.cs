using System.ComponentModel;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.WorkStatuss.Dto;

namespace Novologs.Application.WorkStatuss.Queries.GetWorkStatus;

public record GetWorkStatusQuery : IRequest<Result<GetWorkStatusResponse>>, IFilter
{
    [Description("Search criteria. Specify FieldName(e.g., \"Name\"), FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
}

public class GetWorkStatusResponse : FilteredResult<WorkStatusDto>
{
}

public class GetWorkStatusQueryValidator : AbstractValidator<GetWorkStatusQuery>
{
    public GetWorkStatusQueryValidator(ITenantDbContext context, IUser user)
    {
    }
}

public class GetWorkStatusQueryHandler : IRequestHandler<GetWorkStatusQuery, Result<GetWorkStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public GetWorkStatusQueryHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<GetWorkStatusResponse>> Handle(GetWorkStatusQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetWorkStatusResponse();
        var query = _context.GetSet<Domain.Entities.WorkStatus>("Name.LocalizedStrings")
            .AsNoTracking().AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<WorkStatusDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetWorkStatusResponse>.Success(result);
    }
}
