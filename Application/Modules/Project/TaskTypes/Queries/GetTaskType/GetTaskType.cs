using System.ComponentModel;
using Novologs.Application.Modules.Project.Projects.Dto;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.TaskTypes.Queries.GetTaskType;

[Description("Retrieves a list of project task types with pagination, sorting, and filtering options.")]
public record GetTaskTypeQuery : IRequest<Result<GetTaskTypeResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Name\")," +
        " FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
}

public class GetTaskTypeResponse : FilteredResult<ProjectTaskTypeDto>
{
}

public class GetTaskTypeQueryValidator : AbstractValidator<GetTaskTypeQuery>
{
    public GetTaskTypeQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetTaskTypeQueryHandler : IRequestHandler<GetTaskTypeQuery, Result<GetTaskTypeResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetTaskTypeQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetTaskTypeResponse>> Handle(GetTaskTypeQuery request, CancellationToken cancellationToken)
    {
        var result = new GetTaskTypeResponse();
        var query = _context.GetSet<ProjectTaskType>("")
            .AsNoTracking().AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<ProjectTaskTypeDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetTaskTypeResponse>.Success(result);
    }
}
