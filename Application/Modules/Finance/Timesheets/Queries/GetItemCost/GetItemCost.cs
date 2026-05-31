using System.ComponentModel;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Domain.Entities;
using TaskStatus = Novologs.Domain.Entities.TaskStatus;

namespace Novologs.Application.Modules.Finance.ItemCosts.Queries.GetItemCost;

public record GetItemCostQuery : IRequest<Result<GetItemCostResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Code\", \"Serial\" , \"Description\", \"StartDate\", \"EndDate\", " +
        "\"ActualStartDate\", \"ActualEndDate\", \"ProjectId\", \"MileStoneId\", \"ClientId\", \"ClientLeadId\", " +
        "\"VendorId\", \"VendorContractId\", \"DocumentId\", \"StatusId\", \"CategoryId\", \"PriorityId\", " +
        "\"ParentTaskId\", \"CommentThreadId\", \"IsConfidential\", \"IsAssignedToMe\")," +
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
        "MyCreated (0), MyAssigned (1), MyCreatedAndAssigned (2), MyBacklog (3), MyAll (4), AllTask (5), AllBacklog (6), All (7).")]
    public TaskCreatFilter CreatFilter { get; set; } = TaskCreatFilter.MyCreated;

    [Description(
        "Specifies the primary entity to filter tasks by (e.g., Project, Milestone). Defaults to 'None'. See TaskControlEntity " +
        "enum for options: None (0), ParentTask (1), Project (2), Milestone (3), Client (4), ClientLead (5)," +
        " Vendor (6), VendorContract (7).")]
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

    [Description("If true, filters for tasks that are past their due date and not yet completed.")]
    public bool? Overdue { get; set; }
}

public class GetItemCostResponse : FilteredResult<ItemCostDto>
{
    public decimal TotalCost { get; set; }
    public TimeSpan TotalDuration { get; set; }
}

public class GetItemCostQueryHandler : IRequestHandler<GetItemCostQuery, Result<GetItemCostResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetItemCostQueryHandler(ITenantDbContext context, IMapper mapper, IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _userManager = userManager;
    }

    public async Task<Result<GetItemCostResponse>> Handle(GetItemCostQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = Guid.Parse(_user.Id!);
        var result = new GetItemCostResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.ProjectTask>()
            .AsNoTracking().AsSplitQuery();
        
        var hasViewAllPermission = await _userManager.HasPermissionAsync(_context, currentUserId,
            Novologs.Domain.Constants.Permissions.Finance.ViewAllTimesheets) || await _userManager.HasPermissionAsync(_context, currentUserId, Novologs.Domain.Constants.Permissions.General.ViewAll);

        if (!hasViewAllPermission)
        {
            query = query.Where(d =>
                d.CreatorId == currentUserId ||
                d.Members.Any(m => m.MemberId == currentUserId) ||
                (d.ClientId.HasValue && d.Client!.CreatorId == currentUserId) ||
                (d.ClientLeadId.HasValue && (d.ClientLead!.CreatorId == currentUserId ||
                                             d.ClientLead.Client!.CreatorId == currentUserId)) ||
                (d.VendorId.HasValue && d.Vendor!.CreatorId == currentUserId) ||
                (d.VendorContractId.HasValue && (d.VendorContract!.CreatorId == currentUserId ||
                                                 d.VendorContract.Vendor!.CreatorId == currentUserId)) ||
                (d.ProjectId.HasValue && d.Project!.ProjectMembers.Any(m => m.MemberId == currentUserId)) ||
                (d.MileStoneId.HasValue &&
                 d.MileStone!.Project!.ProjectMembers.Any(m => m.MemberId == currentUserId))
            );
        }
        
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
                    .Where(d => userIds.Contains(d.CreatorId));
                break;
            case TaskCreatFilter.MyAll:
                query = query
                    .Where(d =>
                        userIds.Contains(d.CreatorId) || d.Members.Any(m => userIds.Contains(m.MemberId)));
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
            query = query.Where(d => request.CategoryId.Contains(d.CategoryId!.Value));
        }

        if (request.PriorityId != null && request.PriorityId.Any())
        {
            query = query.Where(d => request.PriorityId.Contains(d.PriorityId!.Value));
        }

        if (request.Overdue == true)
        {
            query = query.Where(d =>
                d.Status!.Status != Novologs.Domain.Enums.ProjectTaskStatus.Completed && d.EndDate <= DateTime.UtcNow);
        }

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);
        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        var tasks = await query.ToListAsync(cancellationToken);
        var taskIds = tasks.Select(t => t.Id).ToList();

        var timesheets = await _context.GetSet<Novologs.Domain.Entities.TimeSheet>("")
            .Include(t => t.User)
            .Include(t => t.TimeSlots)
            .Where(t => taskIds.Contains(t.TaskId))
            .ToListAsync(cancellationToken);

        var itemCosts = new List<ItemCostDto>();

        foreach (var task in tasks)
        {
            var itemCostDto = _mapper.Map<ItemCostDto>(task);
            var taskTimesheets = timesheets.Where(ts => ts.TaskId == task.Id).ToList();

            foreach (var timesheet in taskTimesheets)
            {
                var taskTotalDuration = timesheet.TimeSlots.Aggregate(TimeSpan.Zero, (sum, ts) => sum + ts.Duration);
                itemCostDto.Duration += taskTotalDuration;
                itemCostDto.Cost += timesheet.User!.HourlyRate * (decimal)taskTotalDuration.TotalHours;
            }

            itemCosts.Add(itemCostDto);
            result.TotalCost += itemCostDto.Cost ?? 0;
            result.TotalDuration += itemCostDto.Duration;
        }

        result.Items = itemCosts;

        return Result<GetItemCostResponse>.Success(result);
    }
}
