using Microsoft.AspNetCore.Identity;
using Novologs.Domain.Constants;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Application.User.Dto;
using Novologs.Application.UserStatistics.Dto;
using Novologs.Application.UserStatistics.Queries.GetUserStatistic;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.UserStatistics.Queries.GetAdminStatistic;

public record GetAdminStatisticQuery : IRequest<Result<GetAdminStatisticResponse>>
{
    public Guid? UserId { get; set; } 
}

public class GetAdminStatisticResponse
{
    public TenantUserDto? User { get; set; }
    public int TotalProjects { get; set; }
    public int TotalTasks { get; set; }
    public List<TaskStatistic> TotalTasksByStatus { get; set; } = new();
    public List<ProjectStatistic> ProjectStatistics { get; set; } = new();
    public int TotalClients { get; set; }
    public int TotalOpenLeads { get; set; }
    public int TotalAwardedLeads { get; set; }
    public int TotalRejectedLeads { get; set; }
    public decimal ThisMonthTarget { get; set; }
    public decimal ThisMonthSales { get; set; } 
    public decimal TotalLeadAmount { get; set; }
    public decimal AwardedLeadAmount { get; set; }
    public decimal RejectedLeadAmount { get; set; }
    public int ActiveClientsCount { get; set; }
    public List<TargetMonthlyDto> MonthlyTargets { get; set; } = new();
    public int TotalVendors { get; set; }
    public int ActiveVendors { get; set; }
    public int TotalContractsCreatedThisYear { get; set; }
    public int TeamMembersCount { get; set; }
    public int InternalUsersCount { get; set; }
    public int ExternalUsersCount { get; set; }
    public int UnreadChatMessagesCount { get; set; }
    public TenantUserDto? ReportedTo { get; set; }
}

public class GetAdminStatisticQueryValidator : AbstractValidator<GetAdminStatisticQuery>
{
    public GetAdminStatisticQueryValidator()
    {
    }
}

public class GetAdminStatisticQueryHandler : IRequestHandler<GetAdminStatisticQuery, Result<GetAdminStatisticResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly UserManager<TenantUser> _userManager;

    public GetAdminStatisticQueryHandler(ITenantDbContext context, IUser user, IMapper mapper, UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
        _userManager = userManager;
    }

    public async Task<Result<GetAdminStatisticResponse>> Handle(GetAdminStatisticQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetAdminStatisticResponse();
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endOfMonth = startOfMonth.AddMonths(1).AddSeconds(-1);
        var startOfYear = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var endOfYear = startOfYear.AddYears(1).AddSeconds(-1);

        IQueryable<Domain.Entities.Project> projectsQuery;
        IQueryable<Domain.Entities.ProjectTask> tasksQuery;
        IQueryable<Domain.Entities.Client> clientsQuery;
        IQueryable<Domain.Entities.ClientLead> leadsQuery;
        IQueryable<Domain.Entities.SalesTarget> salesTargetsQuery;
        IQueryable<Domain.Entities.ChatMessageReciever> chatMessagesQuery;
        IQueryable<Domain.Entities.Vendor> vendorsQuery;

        if (request.UserId.HasValue)
        {
            projectsQuery = _context.GetSet<Domain.Entities.Project>("")
                .Where(p => p.ProjectMembers.Any(pm => pm.MemberId == request.UserId));
            tasksQuery = _context.GetSet<Domain.Entities.ProjectTask>("")
                .Where(t => t.Members.Any(m => m.MemberId == request.UserId));
            clientsQuery = _context.GetSet<Domain.Entities.Client>("")
                .Where(c => c.CreatorId == request.UserId);
            leadsQuery = _context.GetSet<Domain.Entities.ClientLead>("")
                .Where(cl => cl.CreatorId == request.UserId);
            salesTargetsQuery = _context.GetSet<Domain.Entities.SalesTarget>("")
                .Where(st => st.UserId == request.UserId);
            chatMessagesQuery = _context.GetSet<Domain.Entities.ChatMessageReciever>()
                .Where(cmr => cmr.RecieverId == request.UserId);
            vendorsQuery = _context.GetSet<Domain.Entities.Vendor>("").Where(v => v.CreatorId == request.UserId);
        }
        else
        {
            projectsQuery = _context.GetSet<Domain.Entities.Project>("");
            tasksQuery = _context.GetSet<Domain.Entities.ProjectTask>("");
            clientsQuery = _context.GetSet<Domain.Entities.Client>("");
            leadsQuery = _context.GetSet<Domain.Entities.ClientLead>("");
            salesTargetsQuery = _context.GetSet<Domain.Entities.SalesTarget>("");
            chatMessagesQuery = _context.GetSet<Domain.Entities.ChatMessageReciever>();
            vendorsQuery = _context.GetSet<Domain.Entities.Vendor>("");
        }

        var user = request.UserId.HasValue
            ? await _context.GetSet<Domain.Entities.TenantUser>("")
                .AsNoTracking().AsSplitQuery()
                .Where(u => u.Id == request.UserId)
                .ProjectTo<TenantUserDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken)
            : null;

        var userProjects = await projectsQuery
            .Include(p => p.Tasks)
            .AsNoTracking().AsSplitQuery()
            .ToListAsync(cancellationToken);

        var userTasks = await tasksQuery
            .AsNoTracking().AsSplitQuery()
            .ToListAsync(cancellationToken);

        var taskStatuses = await _context.GetSet<Domain.Entities.TaskStatus>("")
            .Include(ts => ts.Name.LocalizedStrings)
            .AsNoTracking().AsSplitQuery()
            .ToListAsync(cancellationToken);

        //calculate statistics
        result.User = user;
        result.TotalProjects = userProjects.Count;
        result.TotalTasks = userTasks.Count;

        var userTaskStatistics = new List<TaskStatistic>();
        foreach (var taskStatus in taskStatuses)
        {
            var count = userTasks.Count(t => t.StatusId == taskStatus.Id);
            userTaskStatistics.Add(new TaskStatistic
            {
                Status = _mapper.Map<TaskStatusDto>(taskStatus), Count = count
            });
        }

        result.TotalTasksByStatus = userTaskStatistics;

        var projectStatistics = new List<ProjectStatistic>();
        foreach (Project project in userProjects)
        {
            var statistice = new ProjectStatistic();
            statistice.Project = _mapper.Map<ProjectDto>(project);
            statistice.TotalTasksByStatus = taskStatuses.Select(taskStatus => new TaskStatistic
            {
                Status = _mapper.Map<TaskStatusDto>(taskStatus),
                Count = project.Tasks.Count(t => t.StatusId == taskStatus.Id)
            }).ToList();
            projectStatistics.Add(statistice);
        }

        result.ProjectStatistics = projectStatistics;


        //total clients, total Open leads, awarded, rejected, this month target , this month sales (achieved)
        var userClients = await clientsQuery
            .Include(c => c.ClientLeads)
            .AsNoTracking().AsSplitQuery()
            .ToListAsync(cancellationToken);
        result.TotalClients = userClients.Count;

        var userLeads = await leadsQuery
            .AsNoTracking().AsSplitQuery()
            .ToListAsync(cancellationToken);

        result.TotalOpenLeads = userLeads
            .Where(l => l.Created >= startOfMonth && l.Created <= endOfMonth)
            .Count(cl => cl.LeadStatus == LeadStatus.Open);
        result.TotalAwardedLeads = userLeads
            .Where(l => l.AwardedDate >= startOfMonth && l.AwardedDate <= endOfMonth)
            .Count(cl => cl.LeadStatus == LeadStatus.Awarded);
        result.TotalRejectedLeads = userLeads
            .Where(l => l.RejectedDate >= startOfMonth && l.RejectedDate <= endOfMonth)
            .Count(cl => cl.LeadStatus == LeadStatus.Rejected);

        var thisMonthTarget = await salesTargetsQuery
            .Where(st => st.Date >= startOfMonth && st.Date <= endOfMonth)
            .SumAsync(st => st.Value, cancellationToken);
        result.ThisMonthTarget = thisMonthTarget;

        var thisMonthSales = userLeads
            .Where(cl => cl.LeadStatus == LeadStatus.Awarded && cl.AwardedDate.HasValue &&
                         cl.AwardedDate.Value >= startOfMonth && cl.AwardedDate.Value <= endOfMonth &&
                         cl.AwardedValue.HasValue)
            .Sum(cl => cl.AwardedValue!.Value);
        result.ThisMonthSales = (decimal)thisMonthSales;

        result.ActiveClientsCount = userClients.Count(c => c.ClientLeads.Any());

        var userVendors = await vendorsQuery
            .Include(v => v.VendorContracts)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        result.TotalVendors = userVendors.Count;
        result.ActiveVendors = userVendors.Count(v => v.VendorContracts.Any());
        
        result.TotalContractsCreatedThisYear = userVendors
            .SelectMany(v => v.VendorContracts)
            .Count(c => c.Created >= startOfYear && c.Created <= endOfYear);
        
        var yearlyTargets = await salesTargetsQuery
            .Where(st => st.Date >= startOfYear && st.Date <= endOfYear)
            .ToListAsync(cancellationToken);

        var yearlyLeads = userLeads
            .Where(cl => cl.LeadStatus == LeadStatus.Awarded && cl.AwardedDate.HasValue &&
                         cl.AwardedDate.Value >= startOfYear && cl.AwardedDate.Value <= endOfYear &&
                         cl.AwardedValue.HasValue)
            .ToList();

        result.TotalLeadAmount = (decimal)userLeads
            .Where(cl => cl.LeadStatus == LeadStatus.Open && cl.Value.HasValue)
            .Sum(cl => cl.Value!.Value);
        result.AwardedLeadAmount = (decimal)yearlyLeads
            .Sum(cl => cl.AwardedValue!.Value);
        result.RejectedLeadAmount = (decimal)userLeads
            .Where(cl => cl.LeadStatus == LeadStatus.Rejected && cl.RejectedDate.HasValue &&
                         cl.RejectedDate.Value >= startOfYear && cl.RejectedDate.Value <= endOfYear &&
                         cl.Value.HasValue)
            .Sum(cl => cl.Value!.Value);

        for (int i = 0; i < 12; i++)
        {
            var month = startOfYear.AddMonths(i);
            var endOfMonthLoop = month.AddMonths(1).AddSeconds(-1);

            var monthTarget = yearlyTargets
                .Where(st => st.Date >= month && st.Date <= endOfMonthLoop)
                .Sum(st => st.Value);

            var monthSales = yearlyLeads
                .Where(cl => cl.AwardedDate.HasValue && cl.AwardedDate.Value >= month &&
                             cl.AwardedDate.Value <= endOfMonthLoop)
                .Sum(cl => cl.AwardedValue!.Value);

            result.MonthlyTargets.Add(new TargetMonthlyDto(month, monthTarget, (decimal)monthSales));
        }

        var unreadChatMessagesCount = await chatMessagesQuery
            .Where(cmr => cmr.Status != ChatReciverMessageSeenStatus.Seen)
            .CountAsync(cancellationToken);
        result.UnreadChatMessagesCount = unreadChatMessagesCount;

        if (!request.UserId.HasValue)
        {
            result.TeamMembersCount = await _context.GetSet<Domain.Entities.TenantUser>().CountAsync(cancellationToken);
            result.InternalUsersCount = (await _userManager.GetUsersInRoleAsync(Domain.Constants.Roles.Internal)).Count;
            result.ExternalUsersCount = (await _userManager.GetUsersInRoleAsync(Domain.Constants.Roles.External)).Count;
        }
        else
        {
            var organizationStructure = await _context.GetSet<OrganizationStructure>()
                .Include(d => d.Children)
                .AsSingleQuery().AsNoTracking()
                .ToListAsync(cancellationToken);
            var currentUserNode = organizationStructure
                .FirstOrDefault(d => d.EmployeeId == request.UserId);

            if (currentUserNode != null)
            {
                var allDescendantEmployeesIds = HierarchUtil.GetAllDescendantEmployeesIds(currentUserNode);
                result.TeamMembersCount = allDescendantEmployeesIds.Count(id => id != request.UserId!.Value);

                // Walk up the hierarchy to find the first ancestor with an assigned employee (direct manager)
                var currentSearch = currentUserNode;
                OrganizationStructure? managerNode = null;
                while (currentSearch != null)
                {
                    if (currentSearch.ParentStructureId == null) break;
                    var parentNode = organizationStructure.FirstOrDefault(o => o.Id == currentSearch.ParentStructureId);
                    if (parentNode?.EmployeeId != null) { managerNode = parentNode; break; }
                    currentSearch = parentNode;
                }
                if (managerNode?.EmployeeId != null)
                {
                    result.ReportedTo = await _context.GetSet<Domain.Entities.TenantUser>("")
                        .AsNoTracking()
                        .Where(u => u.Id == managerNode.EmployeeId)
                        .ProjectTo<TenantUserDto>(_mapper.ConfigurationProvider)
                        .FirstOrDefaultAsync(cancellationToken);
                }

                var internalUsers = await _userManager.GetUsersInRoleAsync(Domain.Constants.Roles.Internal);
                var externalUsers = await _userManager.GetUsersInRoleAsync(Domain.Constants.Roles.External);

                result.InternalUsersCount = internalUsers.Count(u => allDescendantEmployeesIds.Contains(u.Id));
                result.ExternalUsersCount = externalUsers.Count(u => allDescendantEmployeesIds.Contains(u.Id));
            }
            else
            {
                result.TeamMembersCount = 0;
                result.InternalUsersCount = 0;
                result.ExternalUsersCount = 0;
            }
        }

        if (request.UserId.HasValue)
        {
            var userEntity = await _context.GetSet<Domain.Entities.TenantUser>()
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
            if (userEntity != null)
            {
                result.User = _mapper.Map<TenantUserDto>(userEntity);
            }
        }

        return Result<GetAdminStatisticResponse>.Success(result);
    }
}
