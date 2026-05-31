using Novologs.Application.Modules.Project.Projects.Dto;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Goals.Queries.GetGoal;

public record GetGoalQuery : IRequest<Result<GetGoalResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetGoalResponse : FilteredResult<ProjectGoalDto>
{
}

public class GetGoalQueryValidator : AbstractValidator<GetGoalQuery>
{
    public GetGoalQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetGoalQueryHandler : IRequestHandler<GetGoalQuery, Result<GetGoalResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetGoalQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetGoalResponse>> Handle(GetGoalQuery request, CancellationToken cancellationToken)
    {
        var result = new GetGoalResponse();
        var query = _context.GetSet<ProjectGoal>("")
            .AsNoTracking().AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<ProjectGoalDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetGoalResponse>.Success(result);
    }
}
