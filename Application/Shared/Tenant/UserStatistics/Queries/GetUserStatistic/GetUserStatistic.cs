using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Currencys.Dto;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Application.Localizables.DTOs;
using Novologs.Application.User.Dto;
using Novologs.Application.UserStatistics.Dto;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.UserStatistics.Queries.GetUserStatistic;
 
public record GetUserStatisticQuery : IRequest<Result<GetUserStatisticResponse>>
{
    public Guid? UserId { get; set; }
}

public class GetUserStatisticResponse
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

    public int TeamMembersCount { get; set; }
    public int ReportingToCount { get; set; }
    public int UnreadChatMessagesCount { get; set; }
    public TenantUserDto? ReportedTo { get; set; }
}
public record TargetMonthlyDto(DateTime month, decimal target, decimal achived);

public class GetUserStatisticQueryValidator : AbstractValidator<GetUserStatisticQuery>
{
    public GetUserStatisticQueryValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(x => x.UserId)
            .MustAsync(async (userId, cancellationToken) =>
            {
                if (userId == null) return true;
                var userExists = await context.GetSet<Domain.Entities.TenantUser>()
                    .AnyAsync(u => u.Id == userId, cancellationToken);
                return userExists;
            })
            .WithMessage("User not found.");
    }
}

public class GetUserStatisticQueryHandler : IRequestHandler<GetUserStatisticQuery, Result<GetUserStatisticResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly UserManager<TenantUser> _userManager;

    public GetUserStatisticQueryHandler(ITenantDbContext context, IUser user, IMapper mapper, UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
        _userManager = userManager;
    }

    public async Task<Result<GetUserStatisticResponse>> Handle(GetUserStatisticQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetUserStatisticResponse();
        if (request.UserId == null)
        {
            if (_user.Id == null)
            {
                return Result<GetUserStatisticResponse>.Failure("UserStatistic_001", "User not authenticated.");
            }

            if (!Guid.TryParse(_user.Id, out var userId))
            {
                return Result<GetUserStatisticResponse>.Failure("UserStatistic_002", "Invalid user ID format.");
            }

            request.UserId = userId;
        }

        var user = await _context.GetSet<Domain.Entities.TenantUser>("")
            .AsNoTracking().AsSplitQuery()
            .Where(u => u.Id == request.UserId)
            .ProjectTo<TenantUserDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);


        var userProjects = await _context.GetSet<Domain.Entities.Project>("")
            .Include(p => p.Tasks)
            .Where(p => p.ProjectMembers.Any(pm => pm.MemberId == request.UserId))
            .AsNoTracking().AsSplitQuery()
            .ToListAsync(cancellationToken);


        var userTasks = await _context.GetSet<Domain.Entities.ProjectTask>("")
            .Where(t => t.Members.Any(m => m.MemberId == request.UserId))
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


        //total clients, total Open leads, awarded, rejected, this month target , this month sales (acheved)

        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endOfMonth = startOfMonth.AddMonths(1).AddSeconds(-1);

        var userClients = await _context.GetSet<Domain.Entities.Client>("")
            .Include(c => c.ClientLeads)
            .Where(c => c.CreatorId == request.UserId)
            .AsNoTracking().AsSplitQuery()
            .ToListAsync(cancellationToken);
        result.TotalClients = userClients.Count;

        var userLeads = await _context.GetSet<Domain.Entities.ClientLead>("")
            .Where(cl => cl.CreatorId == request.UserId)
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


        var thisMonthTarget = await _context.GetSet<Domain.Entities.SalesTarget>("")
            .Where(st => st.UserId == request.UserId && st.Date >= startOfMonth && st.Date <= endOfMonth)
            .SumAsync(st => st.Value, cancellationToken);
        result.ThisMonthTarget = thisMonthTarget;

        var thisMonthSales = userLeads
            .Where(cl => cl.LeadStatus == LeadStatus.Awarded && cl.AwardedDate.HasValue &&
                         cl.AwardedDate.Value >= startOfMonth && cl.AwardedDate.Value <= endOfMonth &&
                         cl.AwardedValue.HasValue)
            .Sum(cl => cl.AwardedValue!.Value);
        result.ThisMonthSales = (decimal)thisMonthSales;

        result.ActiveClientsCount = userClients.Count(c => c.ClientLeads.Any());

        var startOfYear = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var endOfYear = startOfYear.AddYears(1).AddSeconds(-1);

        var yearlyTargets = await _context.GetSet<Domain.Entities.SalesTarget>("")
            .Where(st => st.UserId == request.UserId && st.Date >= startOfYear && st.Date <= endOfYear)
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

        var orgStructure = await _context.GetSet<Domain.Entities.OrganizationStructure>()
            .AsNoTracking()
            .ToListAsync(cancellationToken);
        var userNode = orgStructure.FirstOrDefault(o => o.EmployeeId == request.UserId);

        // Traverse flat list by FK to correctly count descendants at any hierarchy depth,
        // bypassing nav-property limitations of AsNoTracking (no identity resolution).
        static List<Guid> GetDescendantEmployeeIds(Guid nodeId, List<Domain.Entities.OrganizationStructure> allNodes)
        {
            var result = new List<Guid>();
            foreach (var child in allNodes.Where(n => n.ParentStructureId == nodeId && !n.IsDeleted))
            {
                if (child.EmployeeId.HasValue)
                    result.Add(child.EmployeeId.Value);
                result.AddRange(GetDescendantEmployeeIds(child.Id, allNodes));
            }
            return result;
        }

        if (userNode != null)
        {
            var allDescendantIds = GetDescendantEmployeeIds(userNode.Id, orgStructure);
            var teamCount = allDescendantIds.Count;

            // If the org-tree yields 0 descendants but user has ViewAll permission,
            // fall back to total user count (matches AdminStatistic behavior for admins).
            if (teamCount == 0)
            {
                var isAdmin = await _userManager.HasPermissionAsync(_context, request.UserId!.Value,
                    Domain.Constants.Permissions.General.ViewAll);
                result.TeamMembersCount = isAdmin
                    ? await _context.GetSet<Domain.Entities.TenantUser>().CountAsync(cancellationToken)
                    : 0;
            }
            else
            {
                result.TeamMembersCount = teamCount;
            }

            result.ReportingToCount = orgStructure.Count(n => n.ParentStructureId == userNode.Id && !n.IsDeleted && n.EmployeeId != null);

            // Walk up the hierarchy to find the first ancestor with an assigned employee (direct manager)
            var currentSearch = userNode;
            Domain.Entities.OrganizationStructure? managerNode = null;
            while (currentSearch != null)
            {
                if (currentSearch.ParentStructureId == null) break;
                var parentNode = orgStructure.FirstOrDefault(o => o.Id == currentSearch.ParentStructureId);
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
        }
        else
        {
            // User is not in the org structure (e.g. top-level admin).
            // Fall back to total tenant user count when the user has ViewAll (admin-level) permission,
            // which matches the GetAdminStatistic behavior for admin users without a specified UserId.
            var isAdmin = await _userManager.HasPermissionAsync(_context, request.UserId!.Value,
                Domain.Constants.Permissions.General.ViewAll);
            if (isAdmin)
            {
                result.TeamMembersCount = await _context.GetSet<Domain.Entities.TenantUser>()
                    .CountAsync(cancellationToken);
            }
        }

        var unreadChatMessagesCount = await _context.GetSet<Domain.Entities.ChatMessageReciever>()
            .Where(cmr => cmr.RecieverId == request.UserId && cmr.Status != ChatReciverMessageSeenStatus.Seen)
            .CountAsync(cancellationToken);
        result.UnreadChatMessagesCount = unreadChatMessagesCount;
        
        return Result<GetUserStatisticResponse>.Success(result);
    }
}
