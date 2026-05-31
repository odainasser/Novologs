using Novologs.Application.Modules.Project.Projects.Dto;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Tenant;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Project.MileStones.Queries.GetMileStone;

public record GetMileStoneQuery : IRequest<Result<GetMileStoneResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }

    public Guid ProjectId { get; set; }
}

public class GetMileStoneResponse : FilteredResult<ProjectMileStoneDto>
{
}

public class GetMileStoneQueryValidator : AbstractValidator<GetMileStoneQuery>
{
    public GetMileStoneQueryValidator(ITenantDbContext context)
    {
        RuleFor(v => v.ProjectId)
            .NotEmpty().WithMessage("ProjectId is required.");
        RuleFor(v => v.ProjectId)
            .MustAsync(async (projectId, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.Project>()
                    .AnyAsync(p => p.Id == projectId, cancellationToken);
            }).WithMessage("ProjectId is invalid.");
    }
}

public class GetMileStoneQueryHandler : IRequestHandler<GetMileStoneQuery, Result<GetMileStoneResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetMileStoneQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetMileStoneResponse>> Handle(GetMileStoneQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetMileStoneResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.ProjectMileStone>("")
            .Where(x => x.ProjectId == request.ProjectId)
            .AsNoTracking().AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<ProjectMileStoneDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var rootFolders = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .Where(f => f.Type == FolderType.Shared && f.MilestoneId != null)
            .ToListAsync(cancellationToken);

        foreach (var mileStoneDto in result.Items)
        {
            var rootFolder = rootFolders.FirstOrDefault(f => f.MilestoneId == mileStoneDto.Id);
            mileStoneDto.RootFolderId = rootFolder?.Id;
        }


        return Result<GetMileStoneResponse>.Success(result);
    }
}
