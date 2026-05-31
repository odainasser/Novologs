using Novologs.Application.Modules.Project.Projects.Dto;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Initiatives.Queries.GetInitiative;

public record GetInitiativeQuery : IRequest<Result<GetInitiativeResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetInitiativeResponse : FilteredResult<ProjectInitiativeDto>
{
}

public class GetInitiativeQueryValidator : AbstractValidator<GetInitiativeQuery>
{
    public GetInitiativeQueryValidator()
    {
    }
}

public class GetInitiativeQueryHandler : IRequestHandler<GetInitiativeQuery, Result<GetInitiativeResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetInitiativeQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetInitiativeResponse>> Handle(GetInitiativeQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetInitiativeResponse();
        var query = _context.GetSet<ProjectInitiative>("")
            .AsNoTracking().AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<ProjectInitiativeDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetInitiativeResponse>.Success(result);
    }
}
