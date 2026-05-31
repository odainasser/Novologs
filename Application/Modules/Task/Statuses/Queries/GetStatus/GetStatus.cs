using System.ComponentModel;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Modules.Tasks.Statuses.Dto;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Tasks.Statuses.Queries.GetStatus;

public record GetStatusQuery : IRequest<Result<GetStatusResponse>>, IFilter
{
    [Description("Search criteria. Specify FieldName(e.g., \"Name\"), FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
}

public class GetStatusResponse : FilteredResult<TaskStatusDto>
{
}

public class GetStatusQueryValidator : AbstractValidator<GetStatusQuery>
{
    public GetStatusQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetStatusQueryHandler : IRequestHandler<GetStatusQuery, Result<GetStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetStatusQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetStatusResponse>> Handle(GetStatusQuery request, CancellationToken cancellationToken)
    {
        var result = new GetStatusResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.TaskStatus>("")
            .AsNoTracking().AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<TaskStatusDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetStatusResponse>.Success(result);
    }
}
