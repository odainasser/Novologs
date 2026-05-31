using System.ComponentModel;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Modules.Tasks.Categories.Dto;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Tasks.Categories.Queries.GetCategory;

public record GetCategoryQuery : IRequest<Result<GetCategoryResponse>>, IFilter
{
    [Description("Search criteria. Specify FieldName(e.g., \"Name\"), FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
}

public class GetCategoryResponse : FilteredResult<TaskCategoryDto>
{
}

public class GetCategoryQueryValidator : AbstractValidator<GetCategoryQuery>
{
    public GetCategoryQueryValidator()
    {
    }
}

public class GetCategoryQueryHandler : IRequestHandler<GetCategoryQuery, Result<GetCategoryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetCategoryQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetCategoryResponse>> Handle(GetCategoryQuery request, CancellationToken cancellationToken)
    {
        var result = new GetCategoryResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.TaskCategory>()
            .AsNoTracking().AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<TaskCategoryDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetCategoryResponse>.Success(result);
    }
}
