using System.ComponentModel;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Modules.Tasks.Tasks.Dto;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Application.Tenant;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Tasks.Tasks.Queries.GetTaskQuery;

[Description("Retrieves a list of tasks with pagination, sorting, and filtering options. " +
             "This tool is suitable for dynamic data and should not be cached.")]
public record GetTasksQuery : IRequest<Result<GetTasksQueryResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Code\", \"Serial\" , \"Description\", \"StartDate\", \"EndDate\", " +
        "\"ActualStartDate\", \"ActualEndDate\", \"ProjectId\", \"MileStoneId\", \"ClientId\", \"ClientLeadId\", " +
        "\"VendorId\", \"VendorContractId\", \"DocumentId\", \"StatusId\", \"CategoryId\", \"PriorityId\", " +
        "\"ParentTaskId\", \"CommentThreadId\", \"IsConfidential\", \"IsAssignedToMe\", " +
        "\"AssignedToIds\" (array of member GUIDs — filters tasks where any member matches), " +
        "\"AssignedByIds\" (array of creator GUIDs — filters tasks by creator))," +
        " FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }

    [Description(
        "A list of user IDs to filter tasks by (tasks related to this users) if null will return current user tasks." +
        "Applied in conjunction with CreatFilter logic.")]
    public List<Guid?>? UserIds { get; set; }

    [Description(
        "If true, filters tasks for the current user's subordinates in the organization hierarchy. " +
        "UserIds will be ignored if this is true.")]
    public bool? MyEmployee { get; set; }

    [Description(
        "Filter tasks based on creator/assignee. Defaults to 'MyCreated'. See TaskCreatFilter enum for options: " +
        "MyCreated (0), MyAssigned (1), MyCreatedAndAssigned (2), MyBacklog (3), MyAll (4), Task (5), Backlog (6), " +
        "All (7) — returns all tasks; when MyEmployee=true or UserIds is set, restricts to tasks created by or assigned to those users (team manager view).")]
    public TaskCreatFilter CreatFilter { get; set; } = TaskCreatFilter.MyCreated;

    [Description(
        "Specifies the primary entity to filter tasks by (e.g., Project, Milestone). Defaults to 'None'. See TaskControlEntity " +
        " enum for options: None (0), VendorContract (7), ParentTask (1), Milestone (3), Client (4), Project (2)," +
        " ClientLead (5), Vendor (6).")]
    public TaskControlEntity ControlEntity { get; set; } = TaskControlEntity.None;

    [Description(
        "When true and ControlEntity is Project, Client, or Vendor, includes tasks from related sub-entities " +
        "(Milestones for Project, Client Leads for Client, Vendor Contracts for Vendor). Defaults to false.")]
    public bool? Deeplink { get; set; } = false;

    [Description(
        "The ID of the entity specified by ControlEntity. Used for filtering tasks related to that specific entity instance.")]
    public Guid? ControlEntityId { get; set; }

    [Description("A list of status IDs to filter tasks. Tasks must match one of the specified statuses.")]
    public List<Guid>? StatusIds { get; set; }

    [Description("A list of category IDs to filter tasks. Tasks must belong to one of the specified categories.")]
    public List<Guid>? CategoryId { get; set; }

    [Description("A list of priority IDs to filter tasks. Tasks must have one of the specified priorities.")]
    public List<Guid>? PriorityId { get; set; }

    [Description("A list of user IDs to filter tasks by who created/assigned the task (CreatorId).")]
    public List<Guid>? AssignedByIds { get; set; }

    [Description("A list of user IDs to filter tasks by who is assigned to the task (task members).")]
    public List<Guid>? AssignedToIds { get; set; }

    [Description("If true, filters for tasks that are past their due date and not yet completed.")]
    public bool? Overdue { get; set; }

    [Description(
        "If true, filters for tasks that were completed after their EndDate. " +
        "This means the task's status is 'Completed' and its 'ActualEndDate' is greater than or equal to its 'EndDate'.")]
    public bool? isLate { get; set; }

    public ProjectType? ProjectTypeFilter { get; set; }
}

public class GetTasksQueryResponse : FilteredResult<ProjectTaskDto>
{
}

public class GetTasksQueryHandler : IRequestHandler<GetTasksQuery, Result<GetTasksQueryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public GetTasksQueryHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<GetTasksQueryResponse>> Handle(GetTasksQuery request,
        CancellationToken cancellationToken)
    {
        var currentUserId = Guid.Parse(_user.Id!);
        var result = new GetTasksQueryResponse();
        IQueryable<ProjectTask> query = _context.GetSet<Novologs.Domain.Entities.ProjectTask>
            ("Creator.Designation.Name.LocalizedStrings," +
             "Creator.ProfileImageFile," +
             "Members.TenantUser.ProfileImageFile," +
             "Members.TenantUser.Designation.Name.LocalizedStrings," +
             "Members.Status.Name.LocalizedStrings," +
             "Project,MileStone,Client,ClientLead,Vendor,VendorContract," +
             "Status.Name.LocalizedStrings," +
             "Category.Name.LocalizedStrings," +
             "Priority.Name.LocalizedStrings," +
             "ParentTask,AudioFile,ChildTasks,TodoItems.Members")
            .AsNoTracking().AsSplitQuery();

        switch (request.ControlEntity)
        {
            case TaskControlEntity.ParentTask:
                query = query.Where(d => d.ParentTaskId == request.ControlEntityId);
                break;
            case TaskControlEntity.Project:
                if (request.Deeplink == true)
                {
                    query = query.Where(d => d.ProjectId == request.ControlEntityId ||
                                             (d.MileStone != null && d.MileStone.ProjectId == request.ControlEntityId));
                }
                else
                {
                    query = query.Where(d => d.ProjectId == request.ControlEntityId);
                }

                break;
            case TaskControlEntity.Milestone:
                query = query.Where(d => d.MileStoneId == request.ControlEntityId);
                break;
            case TaskControlEntity.Client:
                if (request.Deeplink == true)
                {
                    query = query.Where(d => d.ClientId == request.ControlEntityId ||
                                             (d.ClientLead != null &&
                                              d.ClientLead.ClientId == request.ControlEntityId));
                }
                else
                {
                    query = query.Where(d => d.ClientId == request.ControlEntityId);
                }

                break;
            case TaskControlEntity.ClientLead:
                query = query.Where(d => d.ClientLeadId == request.ControlEntityId);
                break;
            case TaskControlEntity.Vendor:
                if (request.Deeplink == true)
                {
                    query = query.Where(d => d.VendorId == request.ControlEntityId ||
                                             (d.VendorContract != null &&
                                              d.VendorContract.VendorId == request.ControlEntityId));
                }
                else
                {
                    query = query.Where(d => d.VendorId == request.ControlEntityId);
                }

                break;
            case TaskControlEntity.VendorContract:
                query = query.Where(d => d.VendorContractId == request.ControlEntityId);
                break;
            //case general means all null
            case TaskControlEntity.General:
                query = query.Where(d => d.ProjectId == null && d.MileStoneId == null && d.ClientId == null &&
                                         d.ClientLeadId == null && d.VendorId == null && d.VendorContractId == null);
                break;
            default:
            case TaskControlEntity.None:
                break;
        }

        var userIds = new List<Guid?>();
        if (request.MyEmployee == true)
        {
            var employeesIds = new List<Guid?>();

            var organizationStructure = await _context.GetSet<OrganizationStructure>()
                .Include(d => d.Children)
                .ToListAsync(cancellationToken);
            var currentUserNode = organizationStructure
                .FirstOrDefault(d => d.EmployeeId == currentUserId);

            if (currentUserNode != null)
            {
                employeesIds = HierarchUtil.GetAllDescendantEmployeesIds(currentUserNode).Select(id => (Guid?)id)
                    .ToList();
                employeesIds.Remove(currentUserId);
            }

            userIds.AddRange(employeesIds);
            userIds = userIds.Distinct().ToList();
        }
        else if (request.UserIds == null || !request.UserIds.Any())
        {
            userIds = new List<Guid?>() { currentUserId };
        }
        else
        {
            userIds = request.UserIds;
        }

        switch (request.CreatFilter)
        {
            case TaskCreatFilter.MyCreated:
                query = query
                    .Where(d => d.Members.Any())
                    .Where(d => userIds.Contains(d.CreatorId));
                break;
            case TaskCreatFilter.MyAssigned:
                query = query
                    .Where(d => d.Members.Any())
                    .Where(d => d.Members.Any(m => userIds.Contains(m.MemberId)));
                break;
            case TaskCreatFilter.MyCreatedAndAssigned:
                query = query
                    .Where(d => d.Members.Any())
                    .Where(d =>
                        userIds.Contains(d.CreatorId) || d.Members.Any(m => userIds.Contains(m.MemberId)));
                break;
            case TaskCreatFilter.MyBacklog:
                query = query
                    .Where(d => !d.Members.Any())
                    .Where(d => userIds.Contains(d.CreatorId) ||
                                (d.Project != null && d.Project.Type == ProjectType.Ticketing &&
                                 d.Project.ProjectMembers.Any(pm => userIds.Contains(pm.MemberId))));
                break;
            case TaskCreatFilter.MyAll:
                query = query
                    .Where(d =>
                        userIds.Contains(d.CreatorId) || d.Members.Any(m => userIds.Contains(m.MemberId)) ||
                        (!d.Members.Any() && d.Project != null && d.Project.Type == ProjectType.Ticketing &&
                         d.Project.ProjectMembers.Any(pm => userIds.Contains(pm.MemberId))));
                break;
            case TaskCreatFilter.Task:
                query = query
                    .Where(d => d.Members.Any());
                break;
            case TaskCreatFilter.Backlog:
                query = query
                    .Where(d => !d.Members.Any());
                break;
            default:
            case TaskCreatFilter.All:
                // When an explicit team scope is requested (MyEmployee or UserIds), restrict
                // to tasks that belong to those users; otherwise return everything.
                if (request.MyEmployee == true || (request.UserIds != null && request.UserIds.Any()))
                    query = query.Where(d =>
                        userIds.Contains(d.CreatorId) ||
                        d.Members.Any(m => userIds.Contains(m.MemberId)));
                break;
        }

        if (request.StatusIds != null && request.StatusIds.Any())
        {
            query = query.Where(d => request.StatusIds.Contains(d.StatusId));
        }

        if (request.CategoryId != null && request.CategoryId.Any())
        {
            if (request.CategoryId.Contains(Guid.Empty))
            {
                query = query.Where(d => request.CategoryId.Contains(d.CategoryId!.Value) || d.CategoryId == null);
            }
            else
            {
                query = query.Where(d => request.CategoryId.Contains(d.CategoryId!.Value));
            }
        }

        if (request.PriorityId != null && request.PriorityId.Any())
        {
            query = query.Where(d => request.PriorityId.Contains(d.PriorityId!.Value));
        }

        if (request.AssignedByIds != null && request.AssignedByIds.Any())
        {
            query = query.Where(d => request.AssignedByIds.Contains(d.CreatorId));
        }

        if (request.AssignedToIds != null && request.AssignedToIds.Any())
        {
            query = query.Where(d => d.Members.Any(m => m.MemberId.HasValue && request.AssignedToIds.Contains(m.MemberId.Value)));
        }

        if (request.Overdue == true)
        {
            query = query.Where(d =>
                d.Status!.Status != Novologs.Domain.Enums.ProjectTaskStatus.Completed && d.EndDate <= DateTime.UtcNow);
        }

        if (request.isLate == true)
        {
            query = query.Where(d =>
                d.Status!.Status == Novologs.Domain.Enums.ProjectTaskStatus.Completed && d.EndDate <= d.ActualEndDate);
        }

        if (request.ProjectTypeFilter.HasValue)
        {
            query = query.Where(d => d.Project != null && d.Project.Type == request.ProjectTypeFilter.Value);
        }

        // Extract AssignedToIds / AssignedByIds from the search tree — they are virtual fields
        // that cannot be resolved via reflection, so we apply them as direct LINQ before ApplySearch.
        var (cleanedSearch, searchAssignedToIds, searchAssignedByIds) = ExtractSpecialFilters(request.Search);

        if (searchAssignedToIds.Count > 0)
            query = query.Where(d =>
                d.Members.Any(m => m.MemberId.HasValue && searchAssignedToIds.Contains(m.MemberId.Value)));

        if (searchAssignedByIds.Count > 0)
            query = query.Where(d => searchAssignedByIds.Contains(d.CreatorId));

        query = query.ApplySearch(cleanedSearch);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        var sql = query.ToQueryString();

        var dbItems = await query.ToListAsync(cancellationToken);
        result.Items = _mapper.Map<List<ProjectTaskDto>>(dbItems);

        if (result.Items.Count > 0)
        {
            var taskIds = result.Items
                .Where(t => t.Id.HasValue)
                .Select(t => t.Id!.Value)
                .ToList();

            var folderByTask = (await _context.GetSet<Novologs.Domain.Entities.Folder>()
                .AsNoTracking()
                .Where(f => f.TaskId.HasValue && taskIds.Contains(f.TaskId.Value))
                .Select(f => new { f.Id, f.TaskId })
                .ToListAsync(cancellationToken))
                .GroupBy(f => f.TaskId!.Value)
                .ToDictionary(g => g.Key, g => g.First().Id);

            foreach (var taskDto in result.Items)
            {
                if (taskDto.Id.HasValue && folderByTask.TryGetValue(taskDto.Id.Value, out var folderId))
                    taskDto.RootFolderId = folderId;
            }
        }

        return Result<GetTasksQueryResponse>.Success(result);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Helper: strip AssignedToIds / AssignedByIds nodes from the search filter tree
    // and collect the GUID values so that they can be applied as proper LINQ.
    // ──────────────────────────────────────────────────────────────────────────────

    private static (SearchFilter? cleanedFilter, List<Guid> assignedToIds, List<Guid> assignedByIds)
        ExtractSpecialFilters(SearchFilter? filter)
    {
        var assignedToIds = new List<Guid>();
        var assignedByIds = new List<Guid>();
        var cleaned = CleanFilter(filter, assignedToIds, assignedByIds);
        return (cleaned, assignedToIds, assignedByIds);
    }

    private static SearchFilter? CleanFilter(SearchFilter? filter, List<Guid> assignedToIds, List<Guid> assignedByIds)
    {
        if (filter == null) return null;

        bool isAssignedTo = string.Equals(filter.FieldName, "AssignedToIds", StringComparison.OrdinalIgnoreCase);
        bool isAssignedBy = string.Equals(filter.FieldName, "AssignedByIds", StringComparison.OrdinalIgnoreCase);

        if (isAssignedTo || isAssignedBy)
        {
            // Collect GUIDs from this node and all its sub-filters recursively
            CollectGuids(filter, isAssignedTo ? assignedToIds : assignedByIds);
            return null; // Remove this node from the tree
        }

        // Recurse into sub-filters first
        var cleanedSubs = new List<SearchFilter>();
        foreach (var sub in filter.SubFilters)
        {
            var cleanedSub = CleanFilter(sub, assignedToIds, assignedByIds);
            if (cleanedSub != null)
                cleanedSubs.Add(cleanedSub);
        }

        // Skip Contains / Equals filters with an empty string fieldValue and no remaining sub-filters —
        // they are no-ops but would incorrectly exclude rows where the field is null.
        bool hasEmptyStringValue =
            filter.FieldValue is System.Text.Json.JsonElement ev &&
            ev.ValueKind == System.Text.Json.JsonValueKind.String &&
            string.IsNullOrEmpty(ev.GetString());

        if (hasEmptyStringValue &&
            filter.Operator is Operator.Contains or Operator.Equals &&
            !cleanedSubs.Any())
        {
            return null;
        }

        // If after cleaning all sub-filters are gone and this node itself has no meaningful field, skip it
        if (string.IsNullOrEmpty(filter.FieldName) && !cleanedSubs.Any())
            return null;

        return new SearchFilter
        {
            FieldName = filter.FieldName,
            FieldValue = filter.FieldValue,
            Operator = filter.Operator,
            LogicOperator = filter.LogicOperator,
            SubFilters = cleanedSubs
        };
    }

    private static void CollectGuids(SearchFilter filter, List<Guid> target)
    {
        if (filter.FieldValue is System.Text.Json.JsonElement el)
        {
            if (el.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                foreach (var item in el.EnumerateArray())
                    if (Guid.TryParse(item.GetString(), out var g))
                        target.Add(g);
            }
            else if (el.ValueKind == System.Text.Json.JsonValueKind.String &&
                     Guid.TryParse(el.GetString(), out var gs))
            {
                target.Add(gs);
            }
        }

        foreach (var sub in filter.SubFilters)
            CollectGuids(sub, target);
    }
}
