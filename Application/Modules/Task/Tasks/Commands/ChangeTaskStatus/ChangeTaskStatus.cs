using System.Security.Claims;
using Finbuckle.MultiTenant.Abstractions;
using MessageTemplates.Services;
using Microsoft.AspNetCore.Http;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;
using SystemLoaders.Services;
using Novologs.Application.Common.Helpers;
using Novologs.Application.Tenant;

namespace Novologs.Application.Modules.Tasks.Tasks.Commands.ChangeTaskStatus;

public record ChangeTaskStatusCommand : IRequest<Result<ChangeTaskStatusResponse>>
{
    public Guid TaskId { get; set; }
    public Guid StatusId { get; set; }
    public Guid? UserId { get; set; }
}

public class ChangeTaskStatusResponse
{
}

public class ChangeTaskStatusCommandHandler : IRequestHandler<ChangeTaskStatusCommand, Result<ChangeTaskStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly INotificationService _notificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public ChangeTaskStatusCommandHandler(
        ITenantDbContext context,
        IHttpContextAccessor httpContextAccessor,
        INotificationService notificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor
    )
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
        _notificationService = notificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<ChangeTaskStatusResponse>> Handle(ChangeTaskStatusCommand request,
        CancellationToken cancellationToken)
    {
        var changerId = Guid.Parse(_httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var changeeId = request.UserId ?? changerId;

        var task = await _context.GetSet<ProjectTask>()
            .Include(t => t.Status).ThenInclude(s => s!.Name)
            .Include(t => t.Members).ThenInclude(m => m.Status).ThenInclude(s => s!.Name)
            .Include(t => t.Members).ThenInclude(m => m.TenantUser)
            .Include(t => t.Project).ThenInclude(p => p!.ProjectMembers)
            .Include(t => t.Creator)
            .FirstOrDefaultAsync(d => d.Id == request.TaskId, cancellationToken);

        if (task == null)
        {
            return Result<ChangeTaskStatusResponse>.Failure("Task_001", "Task not found.");
        }

        var newStatus = await _context.GetSet<Novologs.Domain.Entities.TaskStatus>()
            .Include(s => s.Name)
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == request.StatusId, cancellationToken);

        if (newStatus == null)
        {
            return Result<ChangeTaskStatusResponse>.Failure("Task_007", "Invalid status ID.");
        }

        var taskDescription = TaskVoiceFileData.GetDescriptionFromJson(task.Description);
                
        string oldStatusName;
        var memberToUpdate = task.Members.FirstOrDefault(m => m.MemberId == changeeId);
        var isTicketingProjectMember = task.Project is { Type: ProjectType.Ticketing } &&
                                       task.Project.ProjectMembers.Any(pm => pm.MemberId == changerId);

        if (memberToUpdate != null)
        {
            oldStatusName = memberToUpdate.Status?.Name?.GetDefaultLocalizedString() ?? "N/A";
            memberToUpdate.StatusId = request.StatusId;
        }
        else if (changeeId == task.CreatorId)
        {
            oldStatusName = task.Status?.Name?.GetDefaultLocalizedString() ?? "N/A";
        }
        else if(!isTicketingProjectMember)
        {
            return Result<ChangeTaskStatusResponse>.Failure("Task_009", "Target user is not a member of this task.");
        }
        else
        {
            // Ticketing project member case
            oldStatusName = task.Status?.Name?.GetDefaultLocalizedString() ?? "N/A";
        }

        
        if (request.UserId == null && (task.CreatorId == changerId || isTicketingProjectMember))
        {
            task.StatusId = request.StatusId;

            if (newStatus.Status == ProjectTaskStatus.Completed && task.ActualEndDate == null)
            {
                task.ActualEndDate = DateTime.UtcNow;
            }
        }

        if (newStatus!.Status == ProjectTaskStatus.InProgress && task.ActualStartDate == null)
        {
            task.ActualStartDate = DateTime.UtcNow;
        }

        var changerUser = await _context.GetSet<TenantUser>().AsNoTracking()
            .FirstAsync(u => u.Id == changerId, cancellationToken);
        var changeeUser = await _context.GetSet<TenantUser>().AsNoTracking()
            .FirstAsync(u => u.Id == changeeId, cancellationToken);


        string statusChangeDescription;
        if (changerId == changeeId)
        {
            statusChangeDescription =
                $"{changerUser.FullName} changed their status for {task.Serial} - {taskDescription} from '{oldStatusName}' to '{newStatus.Name.GetDefaultLocalizedString()}'";
        }
        else
        {
            statusChangeDescription =
                $"{changerUser.FullName} changed {changeeUser.FullName}'s status for {task.Serial} - {taskDescription} from '{oldStatusName}' to '{newStatus.Name.GetDefaultLocalizedString()}'";
        }


        _context.GetSet<ProjectTaskTimeLine>().Add(new()
        {
            ProjectTaskId = task.Id,
            CreatorId = changerId,
            Description = statusChangeDescription,
            Date = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);

        var toNotifyIds = task.Members.Select(m => m.MemberId).ToList();
        toNotifyIds.Add(task.CreatorId);
        toNotifyIds = toNotifyIds.Distinct().Where(id => id.HasValue && id.Value != changerId).Select(id => id)
            .ToList();

        if (task.Project?.Type == ProjectType.Ticketing)
        {
            // For ticketing projects, notify:
            // 1. The ticket creator (if not the changer)
            // 2. All category (project) members (except the changer)
            toNotifyIds = new List<Guid?>();
            
            // Add creator if they're not the one making the change
            if (changerId != task.CreatorId)
            {
                toNotifyIds.Add(task.CreatorId);
            }
            
            // Add all project (category) members except the changer
            var projectMemberIds = task.Project.ProjectMembers
                ?.Select(pm => (Guid?)pm.MemberId)
                .Where(id => id != changerId)
                .ToList() ?? new List<Guid?>();
            
            toNotifyIds.AddRange(projectMemberIds);
            toNotifyIds = toNotifyIds.Distinct().ToList();
        }


        if (toNotifyIds.Any())
        {
            var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
            var membersIds = toNotifyIds.Where(g => g.HasValue).Select(g => g!.Value).ToList();

            await _notificationService.SendNotificationWithUserLanguages(
                _context,
                MessageType.TaskStatusChanged,
                tenantInfo?.Id,
                membersIds,
                new
                {
                    TaskSerial = task.Serial.ToString(),
                    TaskId = task.Id.ToString(),
                    Description = taskDescription,
                    Status = newStatus.Name.GetDefaultLocalizedString()
                },
                cancellationToken);
        }

        return Result<ChangeTaskStatusResponse>.Success(new ChangeTaskStatusResponse());
    }
}
