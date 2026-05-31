using System.ComponentModel;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Tasks.Categories.Queries.GetProjectCategory;

public record GetProjectCategoryQuery : IRequest<Result<GetProjectCategoryResponse>>, IFilter
{
    [Description("Search criteria. Specify FieldName(e.g., \"Name\"), FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }

    [Description("The ID of the project for which to retrieve categories.")]
    public Guid? ProjectId { get; set; }
}

public class GetProjectCategoryResponse : FilteredResult<ProjectTaskCategoryDto>
{
}

public class GetProjectCategoryQueryValidator : AbstractValidator<GetProjectCategoryQuery>
{
    public GetProjectCategoryQueryValidator(ITenantDbContext context, IMapper mapper)
    {
        RuleFor(x => x.ProjectId)
            .MustAsync(async (projectId, cancellationToken) =>
                projectId == null || await context.GetSet<Novologs.Domain.Entities.Project>()
                    .AnyAsync(p => p.Id == projectId, cancellationToken))
            .WithMessage("Project with the specified ID does not exist.");
    }
}

public class
    GetProjectCategoryQueryHandler : IRequestHandler<GetProjectCategoryQuery, Result<GetProjectCategoryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetProjectCategoryQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetProjectCategoryResponse>> Handle(GetProjectCategoryQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetProjectCategoryResponse();

        var projectTasks = await _context.GetSet<Novologs.Domain.Entities.ProjectTask>()
            .AsNoTracking().AsSplitQuery()
            .Include(t => t.Status!.Name)
            .Where(t =>
                t.ClientId == null &&
                t.ClientLeadId == null &&
                t.VendorId == null &&
                t.VendorContractId == null &&
                (t.ProjectId == request.ProjectId || t.MileStone!.ProjectId == request.ProjectId)
            )
            .ToListAsync(cancellationToken);

        var taskStatuses = await _context.GetSet<Novologs.Domain.Entities.TaskStatus>()
            .AsNoTracking().AsSplitQuery()
            .Include(t => t.Name)
            .ToListAsync(cancellationToken);
        var defaultStatus = taskStatuses.First(s => s.Status == Novologs.Domain.Enums.ProjectTaskStatus.NotStarted);


        var query = _context.GetSet<Novologs.Domain.Entities.TaskCategory>()
            .AsNoTracking().AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        var CategoryItems = await query.ProjectTo<ProjectTaskCategoryDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        foreach (var category in CategoryItems)
        {
            var tasksInCategory = projectTasks.Where(t => t.CategoryId == category.Id).ToList();
            if (tasksInCategory.Any())
            {
                var taskStatistics = tasksInCategory
                    .GroupBy(t => t.StatusId)
                    .Select(g => new TaskStatistic
                    {
                        Status = _mapper.Map<ProjectTaskStatusDto>(taskStatuses.First(s => s.Id == g.Key)),
                        Count = g.Count()
                    })
                    .ToList();
                category.TotalTasksByStatus = taskStatistics;
            }
        }

        //remove categories with no tasks
        CategoryItems.RemoveAll(c => !projectTasks.Any(t => t.CategoryId == c.Id));

        // no category for tasks without category
        var noCategoryTasks = projectTasks.Where(t => t.CategoryId == null).ToList();
        if (noCategoryTasks.Any())
        {
            var noCategoryStatistic = new ProjectTaskCategoryDto
            {
                Id = Guid.Empty, // Representing no category
                Name = new LocalizableTextDto
                {
                    Value = "No Category",
                    LocalizedStrings = new List<LocalizedStringDto>
                    {
                        new LocalizedStringDto { Language = "en", Value = "No Category" },
                        new LocalizedStringDto { Language = "ar", Value = "بدون فئة" }
                    }
                },
                TotalTasksByStatus = noCategoryTasks
                    .GroupBy(t => t.StatusId)
                    .Select(g => new TaskStatistic
                    {
                        Status = _mapper.Map<ProjectTaskStatusDto>(taskStatuses.First(s => s.Id == g.Key)),
                        Count = g.Count()
                    })
                    .ToList()
            };
            CategoryItems.Add(noCategoryStatistic);
        }

        result.Items = CategoryItems;
        result.Total = CategoryItems.Count;

        return Result<GetProjectCategoryResponse>.Success(result);
    }
}
