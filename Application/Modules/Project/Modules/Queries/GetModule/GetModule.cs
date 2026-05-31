using System.ComponentModel;
using Novologs.Application.Modules.Project.Projects.Dto;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Modules.Queries.GetModule;

[Description("Retrieves a list of project modules with pagination, sorting, and filtering options.")]
public record GetModuleQuery : IRequest<Result<GetModuleResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Name\")," +
        " FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }

    [Description("The ID of the project for which to retrieve modules.")]
    public Guid ProjectId { get; set; }
}

public class GetModuleResponse : FilteredResult<ProjectModuleDto>
{
}

public class GetModuleQueryValidator : AbstractValidator<GetModuleQuery>
{
    public GetModuleQueryValidator(ITenantDbContext context)
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

public class GetModuleQueryHandler : IRequestHandler<GetModuleQuery, Result<GetModuleResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetModuleQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetModuleResponse>> Handle(GetModuleQuery request, CancellationToken cancellationToken)
    {
        var result = new GetModuleResponse();
        var query = _context.GetSet<ProjectModule>("")
            .Where(x => x.ProjectId == request.ProjectId)
            .AsNoTracking().AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<ProjectModuleDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetModuleResponse>.Success(result);
    }
}
