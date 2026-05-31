using System.ComponentModel;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Modules.Tasks.Priorities.Dto;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Tasks.Priorities.Queries.GetPriority;

public record GetPriorityQuery : IRequest<Result<GetPriorityResponse>>, IFilter
{
    [Description("Search criteria. Specify FieldName(e.g., \"Name\"), FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }

}

public class GetPriorityResponse: FilteredResult<TaskPriorityDto>
{
}

public class GetPriorityQueryValidator : AbstractValidator<GetPriorityQuery>
{
    public GetPriorityQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetPriorityQueryHandler : IRequestHandler<GetPriorityQuery, Result<GetPriorityResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetPriorityQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetPriorityResponse>> Handle(GetPriorityQuery request, CancellationToken cancellationToken)
    {
        var result = new GetPriorityResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.TaskPriority>("")
            .AsNoTracking().AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<TaskPriorityDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetPriorityResponse>.Success(result);

    }
}
