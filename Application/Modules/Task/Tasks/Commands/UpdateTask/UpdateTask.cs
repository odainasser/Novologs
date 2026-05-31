using System.Security.Claims;
using Finbuckle.MultiTenant.Abstractions;
using MessageTemplates.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;
using SystemLoaders.Services;
using Novologs.Application.Common.Helpers;

namespace Novologs.Application.Modules.Tasks.Tasks.Commands.UpdateTask;

public record UpdateTaskCommand : IRequest<Result<UpdateTaskResponse>>
{
    public Guid Id { get; set; }
    public string? Code { get; set; } = null!;
    public Guid? ProjectId { get; set; }
    public Guid? MileStoneId { get; set; }
    public Guid? ClientId { get; set; }
    public Guid? ClientLeadId { get; set; }
    public Guid? VendorId { get; set; }
    public Guid? VendorContractId { get; set; }
    public Guid? DocumentId { get; set; }
    public string? Description { get; set; }
    public List<Guid?> MembersIds { get; set; } = new();
    public bool IsConfidential { get; set; }
    public bool IsAssignedToMe { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? PriorityId { get; set; }
    public Guid? ParentTaskId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateTaskCommand, Novologs.Domain.Entities.ProjectTask>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Description, opt => opt.Ignore())
                .ForMember(dest => dest.Members, opt => opt.Ignore())
                .ForMember(dest => dest.StartDate,
                    opt => opt.MapFrom(src =>
                        src.StartDate.HasValue ? src.StartDate.Value.ToUniversalTime() : (DateTime?)null))
                .ForMember(dest => dest.EndDate,
                    opt => opt.MapFrom(src =>
                        src.EndDate.HasValue ? src.EndDate.Value.ToUniversalTime() : (DateTime?)null))
                ;
        }
    }
}

public class UpdateTaskResponse
{
}

public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, Result<UpdateTaskResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly INotificationService _notificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;
    private readonly IUser _user;
    private readonly ILogger<UpdateTaskCommandHandler> _logger;

    public UpdateTaskCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor,
        INotificationService notificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor,
        IUser user,
        ILogger<UpdateTaskCommandHandler> logger
    )
    {
        _context = context;
        _mapper = mapper;
        _httpContextAccessor = httpContextAccessor;
        _notificationService = notificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
        _user = user;
        _logger = logger;
    }

    public async Task<Result<UpdateTaskResponse>> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        if (_user.IdGuid == null)
        {
            return Result<UpdateTaskResponse>.Failure(new[] { new ErrorItem("User_001", "User not found") });
        }
        var userGuid = _user.IdGuid.Value;
        var changer = await _context.GetSet<TenantUser>().AsNoTracking().FirstOrDefaultAsync(u => u.Id == userGuid, cancellationToken);
        var changerName = changer?.FullName ?? "Unknown User";

        var originalTask = await _context.GetSet<Novologs.Domain.Entities.ProjectTask>()
            .AsNoTracking()
            .Include(t => t.Members)
            .ThenInclude(m => m.TenantUser)
            .Include(t => t.Project)
            .ThenInclude(p => p!.ProjectMembers)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (originalTask == null)
        {
            return Result<UpdateTaskResponse>.Failure(new[] { new ErrorItem("Task_001", "Task not found") });
        }

        var taskToUpdate = await _context.GetSet<Novologs.Domain.Entities.ProjectTask>()
            .Include(t => t.Members)
            .FirstAsync(t => t.Id == request.Id, cancellationToken);

        var isTicketingProject = originalTask.Project?.Type == ProjectType.Ticketing;
        _logger.LogInformation("[DEBUG] UpdateTaskCommandHandler.Handle - TaskId: {TaskId}, IsTicketingProject: {IsTicketing}, ProjectId: {ProjectId}",
            request.Id, isTicketingProject, originalTask.ProjectId);

        var changes = BuildChangesList(request, originalTask);

        _mapper.Map(request, taskToUpdate);

        #region Map Members
        var notStartedStatusId = (await _context.GetSet<Novologs.Domain.Entities.TaskStatus>()
            .FirstAsync(d => d.Status == ProjectTaskStatus.NotStarted, cancellationToken)).Id;

        var requestedMemberIds = new HashSet<Guid?>(request.MembersIds);
        if (request.IsAssignedToMe)
        {
            requestedMemberIds.Add(userGuid);
        }
        
        var finalMemberIds = requestedMemberIds.Distinct().ToList();
        var originalMemberIds = originalTask.Members.Select(m => m.MemberId).ToList();

        var toAddIds = finalMemberIds.Except(originalMemberIds).ToList();
        var toRemoveIds = originalMemberIds.Except(finalMemberIds).ToList();
        var itemType = isTicketingProject ? "ticket" : "task";
        
        if (toRemoveIds.Any())
        {
            var removedMembers = originalTask.Members
                .Where(m => toRemoveIds.Contains(m.MemberId))
                .Select(m => m.TenantUser?.FullName ?? "Unknown User")
                .ToList();
            
            foreach (var removedName in removedMembers)
            {
                changes.Add($"{removedName} was removed from the {itemType}.");
                
                _context.GetSet<ProjectTaskTimeLine>().Add(new()
                {
                    ProjectTaskId = taskToUpdate.Id,
                    CreatorId = userGuid,
                    Description = $"{changerName} removed {removedName} from the task.",
                    Date = DateTime.UtcNow
                });
            }
            await _context.GetSet<ProjectTaskMember>()
                .Where(m => m.TaskId == taskToUpdate.Id && toRemoveIds.Contains(m.MemberId))
                .ExecuteDeleteAsync(cancellationToken);
        }

        if (toAddIds.Any())
        {
            var addedMembers = await _context.GetSet<TenantUser>()
                .Where(u => toAddIds.Contains(u.Id))
                .ToListAsync(cancellationToken);
            
            foreach (var addedMember in addedMembers)
            {
                changes.Add($"{addedMember.FullName} was assigned to the {itemType}.");

                _context.GetSet<ProjectTaskTimeLine>().Add(new()
                {
                    ProjectTaskId = taskToUpdate.Id,
                    CreatorId = userGuid,
                    Description = $"{changerName} added {addedMember.FullName} to the task.",
                    Date = DateTime.UtcNow
                });
            }

            foreach (var id in toAddIds)
            {
                await _context.GetSet<ProjectTaskMember>().AddAsync(new ProjectTaskMember(Guid.NewGuid())
                {
                    TaskId = taskToUpdate.Id, MemberId = id, StatusId = notStartedStatusId
                }, cancellationToken);
            }
       
            // Send notification to newly added members
            var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
            var taskDescription = TaskVoiceFileData.GetDescriptionFromJson(taskToUpdate.Description);
            var addedMemberGuids = toAddIds.Where(id => id.HasValue).Select(id => id!.Value).ToList();

            if (addedMemberGuids.Any())
            {
                if (isTicketingProject)
                {
                    await _notificationService.SendNotificationWithUserLanguages(
                        _context,
                        MessageType.TicketAssigned,
                        tenantInfo?.Id,
                        addedMemberGuids,
                        new
                        {
                            TicketSerial = taskToUpdate.Serial.ToString(),
                            TicketId = taskToUpdate.Id.ToString(),
                            Description = taskDescription,
                            ProjectName = originalTask.Project?.Name ?? "",
                            ProjectId = originalTask.Project?.Id.ToString() ?? ""
                        },
                        cancellationToken);
                }
                else
                {
                    await _notificationService.SendNotificationWithUserLanguages(
                        _context,
                        MessageType.TaskMemberAdded,
                        tenantInfo?.Id,
                        addedMemberGuids,
                        new
                        {
                            TaskSerial = taskToUpdate.Serial.ToString(),
                            TaskId = taskToUpdate.Id.ToString(),
                            Description = taskDescription
                        },
                        cancellationToken);
                }
            }
        }

        var toNotify = originalMemberIds.Except(toRemoveIds).ToList();
        
        // Notify about immediate updates - only if there are actual changes
        // For ticketing projects: always notify project members + creator (they'll see what changed)
        // For regular tasks: only notify if there are tracked changes
        if (isTicketingProject)
        {
            await SendTicketImmediateUpdateNotifications(originalTask, taskToUpdate, changes, userGuid, cancellationToken);
        }
        else if (changes.Any())
        {
            await SendTaskImmediateUpdateNotifications(taskToUpdate, changes, toNotify, cancellationToken);
        }
        else
        {
            _logger.LogInformation("[UpdateTaskCommandHandler] No changes detected for task {TaskId}, skipping update notifications", taskToUpdate.Id);
        }

        // Only notify removed members for non-ticketing projects (ticketing projects don't have task members)
        if (!isTicketingProject && toRemoveIds.Any())
        {
            var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
            var removedMemberIds = toRemoveIds.Where(id => id.HasValue).Select(id => id!.Value).ToList();
            if (removedMemberIds.Any())
            {
                var taskDescription = TaskVoiceFileData.GetDescriptionFromJson(taskToUpdate.Description);

                await _notificationService.SendNotificationWithUserLanguages(
                    _context,
                    MessageType.TaskMemberRemoved,
                    tenantInfo?.Id,
                    removedMemberIds,
                    new
                    {
                        TaskSerial = taskToUpdate.Serial.ToString(),
                        TaskId = taskToUpdate.Id.ToString(),
                        Description = taskDescription
                    },
                    cancellationToken);
            }
        }
        #endregion

        if (request.Description != null)
        {
            // Store description as structured JSON without calling Gemini
            var taskDataFromText = new SystemLoaders.Services.TaskVoiceFileData { TranscriptStr = request.Description };
            taskToUpdate.Description = System.Text.Json.JsonSerializer.Serialize(taskDataFromText);
        }

       // await _context.SaveChangesAsync(cancellationToken);

        if (changes.Any())
        {
            _context.GetSet<ProjectTaskTimeLine>().Add(new ProjectTaskTimeLine(Guid.NewGuid())
            {
                ProjectTaskId = taskToUpdate.Id,
                CreatorId = userGuid,
                Description = string.Join(Environment.NewLine, changes),
                Date = DateTime.UtcNow
            });

            // // Send final change notifications
            // if (isTicketingProject)
            // {
            //     await SendTicketFinalChangeNotifications(originalTask, taskToUpdate, changes, userGuid, cancellationToken);
            // }
            // else
            // {
            //     await SendTaskFinalChangeNotifications(originalTask, taskToUpdate, changes, toNotify, cancellationToken);
            // }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdateTaskResponse>.Success(new UpdateTaskResponse());
    }

    #region Helper Methods

    private List<string> BuildChangesList(UpdateTaskCommand request, Novologs.Domain.Entities.ProjectTask originalTask)
    {
        var changes = new List<string>();
        
        if (request.Code != null && request.Code != originalTask.Code) 
            changes.Add($"Code changed from '{originalTask.Code ?? "N/A"}' to '{request.Code}'.");
        if (request.Description != null && request.Description != originalTask.Description) 
            changes.Add("Description was updated.");
        if (request.ProjectId != originalTask.ProjectId) 
            changes.Add("Project was changed.");
        if (request.MileStoneId != originalTask.MileStoneId) 
            changes.Add("Milestone was changed.");
        if (request.ClientId != originalTask.ClientId) 
            changes.Add("Client was changed.");
        if (request.VendorId != originalTask.VendorId) 
            changes.Add("Vendor was changed.");
        if (request.StartDate.HasValue && request.StartDate.Value.Date != originalTask.StartDate?.Date) 
            changes.Add($"Start date changed from '{originalTask.StartDate:d}' to '{request.StartDate:d}'.");
        if (request.EndDate.HasValue && request.EndDate.Value.Date != originalTask.EndDate?.Date) 
            changes.Add($"End date changed from '{originalTask.EndDate:d}' to '{request.EndDate:d}'.");
        if (request.CategoryId != originalTask.CategoryId) 
            changes.Add("Category was changed.");
        if (request.PriorityId != originalTask.PriorityId) 
            changes.Add("Priority was changed.");
        if (request.IsConfidential != originalTask.IsConfidential) 
            changes.Add(request.IsConfidential ? "Task marked as confidential." : "Task is no longer confidential.");

        return changes;
    }

    private async System.Threading.Tasks.Task SendTaskImmediateUpdateNotifications(
        Novologs.Domain.Entities.ProjectTask taskToUpdate, 
        List<string> changes, 
        List<Guid?> toNotify, 
        CancellationToken cancellationToken)
    {
        if (!toNotify.Any()) return;

        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        var userIds = toNotify.Where(id => id.HasValue).Select(id => id!.Value).ToList();

        if (!userIds.Any()) return;

        var taskDescription = TaskVoiceFileData.GetDescriptionFromJson(taskToUpdate.Description);

        await _notificationService.SendNotificationWithUserLanguages(
            _context,
            MessageType.TaskUpdated,
            tenantInfo?.Id,
            userIds,
            new
            {
                TaskSerial = taskToUpdate.Serial.ToString(),
                TaskId = taskToUpdate.Id.ToString(),
                Description = taskDescription
            },
            cancellationToken);
    }

    private async System.Threading.Tasks.Task SendTicketImmediateUpdateNotifications(
        Novologs.Domain.Entities.ProjectTask originalTask,
        Novologs.Domain.Entities.ProjectTask taskToUpdate, 
        List<string> changes, 
        Guid userGuid,
        CancellationToken cancellationToken)
    {
        // // Get project member IDs, excluding the current user (editor)
        // List<Guid> recipientIds = new List<Guid>();
        
        // // Check if project members are loaded
        // if (originalTask.Project?.ProjectMembers != null && originalTask.Project.ProjectMembers.Any())
        // {
        //     recipientIds = originalTask.Project.ProjectMembers
        //         .Select(pm => pm.MemberId)
        //         .Where(id => id != userGuid)
        //         .Distinct()
        //         .ToList();
        // }
        // else if (originalTask.ProjectId.HasValue)
        // {
        //     // Project members weren't loaded, fetch them explicitly
        //     _logger.LogWarning("[SendTicketImmediateUpdateNotifications] Project members not loaded for ticket {TicketId}, fetching explicitly from ProjectId: {ProjectId}",
        //         taskToUpdate.Id, originalTask.ProjectId);
            
        //     recipientIds = await _context.GetSet<ProjectMember>()
        //         .Where(pm => pm.ProjectId == originalTask.ProjectId.Value && pm.MemberId != userGuid)
        //         .Select(pm => pm.MemberId)
        //         .Distinct()
        //         .ToListAsync(cancellationToken);
        // }
        
        // // Include the task creator if they're not the editor and not already in the list
        // if (originalTask.CreatorId != userGuid && !recipientIds.Contains(originalTask.CreatorId))
        // {
        //     recipientIds.Add(originalTask.CreatorId);
        //     _logger.LogInformation("[SendTicketImmediateUpdateNotifications] Added task creator to notification recipients. CreatorId: {CreatorId}", originalTask.CreatorId);
        // }

        var recipientIds = new HashSet<Guid>();
        
        // 1. Add all project members (owners/watchers)
        if (originalTask.Project?.ProjectMembers != null && originalTask.Project.ProjectMembers.Any())
        {
            foreach (var pm in originalTask.Project.ProjectMembers)
            {
                recipientIds.Add(pm.MemberId);
            }
        }
        else if (originalTask.ProjectId.HasValue)
        {
            _logger.LogWarning("[SendTicketImmediateUpdateNotifications] Project members not loaded for ticket {TicketId}, fetching explicitly from ProjectId: {ProjectId}",
                taskToUpdate.Id, originalTask.ProjectId);
            
            var projectMemberIds = await _context.GetSet<ProjectMember>()
                .Where(pm => pm.ProjectId == originalTask.ProjectId.Value)
                .Select(pm => pm.MemberId)
                .ToListAsync(cancellationToken);
            
            foreach (var id in projectMemberIds)
            {
                recipientIds.Add(id);
            }
        }
        
        // 2. Add task creator (ticket reporter)
        recipientIds.Add(originalTask.CreatorId);
        
        // 3. Add assigned members (from task members)
        if (originalTask.Members != null && originalTask.Members.Any())
        {
            foreach (var member in originalTask.Members)
            {
                if (member.MemberId.HasValue)
                {
                    recipientIds.Add(member.MemberId.Value);
                }
            }
        }
        
        // 4. EXCLUDE the current editor (person making the change)
        recipientIds.Remove(userGuid);
        
        _logger.LogInformation("[SendTicketImmediateUpdateNotifications] TicketId: {TicketId}, ProjectId: {ProjectId}, TotalRecipients: {Count}, EditorId: {EditorId}, CreatorId: {CreatorId}, AssignedMembers: {AssignedCount}",
        taskToUpdate.Id, originalTask.ProjectId, recipientIds.Count, userGuid, originalTask.CreatorId, originalTask.Members?.Count ?? 0);

        if (!recipientIds.Any())
        {
            _logger.LogWarning("[SendTicketImmediateUpdateNotifications] No recipients to notify for ticket {TicketId}. Project: {ProjectId}, ProjectLoaded: {ProjectLoaded}, ProjectMembersLoaded: {MembersLoaded}, CreatorId: {CreatorId}",
                taskToUpdate.Id, originalTask.ProjectId, originalTask.Project != null, originalTask.Project?.ProjectMembers != null, originalTask.CreatorId);
            return;
        }

        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        var recipientUsers = await _context.GetSet<TenantUser>()
            .Where(u => recipientIds.Contains(u.Id))
            .ToListAsync(cancellationToken);

        if (recipientUsers.Any())
        {
            var userIds = recipientUsers.Select(m => m.Id).ToList();
            var taskDescription = TaskVoiceFileData.GetDescriptionFromJson(taskToUpdate.Description);

            _logger.LogInformation("[SendTicketImmediateUpdateNotifications] Sending notification to {Count} recipients (project members + creator + assigned members) for ticket {TicketSerial}",
                userIds.Count, taskToUpdate.Serial);

            await _notificationService.SendNotificationWithUserLanguages(
                _context,
                MessageType.TicketUpdated,
                tenantInfo?.Id,
                userIds,
                new
                {
                    TicketSerial = taskToUpdate.Serial.ToString(),
                    TicketId = taskToUpdate.Id.ToString(),
                    Description = taskDescription,
                    ProjectName = originalTask.Project?.Name ?? "",
                    ProjectId = originalTask.Project?.Id.ToString() ?? ""
                },
                cancellationToken);
        }
        else
        {
            _logger.LogWarning("[SendTicketImmediateUpdateNotifications] Recipient IDs found but no users loaded from database for ticket {TicketId}. RecipientIds: {RecipientIds}",
                taskToUpdate.Id, string.Join(", ", recipientIds));
        }
    }

    // private async System.Threading.Tasks.Task SendTaskFinalChangeNotifications(
    //     Novologs.Domain.Entities.ProjectTask originalTask,
    //     Novologs.Domain.Entities.ProjectTask taskToUpdate, 
    //     List<string> changes, 
    //     List<Guid?> toNotify,
    //     CancellationToken cancellationToken)
    // {
    //     var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        
    //     // Include all current members PLUS the creator for change notifications
    //     var allNotifyIds = new List<Guid?>(toNotify);
    //     if (!allNotifyIds.Contains(originalTask.CreatorId))
    //     {
    //         allNotifyIds.Add(originalTask.CreatorId);
    //     }
        
    //     var members = await _context.GetSet<TenantUser>()
    //         .Where(m => allNotifyIds.Contains(m.Id))
    //         .ToListAsync(cancellationToken);
        
    //     if (members.Any())
    //     {
    //         var recipients = members
    //             .Select(m => new EmailUserInfo() { Email = m.Email!, FirstName = m.FullName, Id = m.Id })
    //             .ToList();
            
    //         var taskDescription = TaskVoiceFileData.GetDescriptionFromJson(taskToUpdate.Description);
            
    //         _taskEmailService.SendTaskUpdatedNotification(
    //             tenantId: tenantInfo?.Id,
    //             recipients: recipients,
    //             taskSerial: taskToUpdate.Serial.ToString(),
    //             taskId: taskToUpdate.Id.ToString(),
    //             description: taskDescription,
    //             changes: changes,
    //             logger: _logger
    //         );
    //     }
    // }

    private async System.Threading.Tasks.Task SendTicketFinalChangeNotifications(
        Novologs.Domain.Entities.ProjectTask originalTask,
        Novologs.Domain.Entities.ProjectTask taskToUpdate, 
        List<string> changes,
        Guid userGuid,
        CancellationToken cancellationToken)
    {
        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        
        var projectMemberIds = originalTask.Project?.ProjectMembers
            ?.Select(pm => pm.MemberId)
            .Where(id => id != userGuid)
            .Distinct()
            .ToList() ?? new List<Guid>();

        if (projectMemberIds.Any())
        {
            var taskDescription = TaskVoiceFileData.GetDescriptionFromJson(taskToUpdate.Description);

            await _notificationService.SendNotificationWithUserLanguages(
                _context,
                MessageType.TicketUpdated,
                tenantInfo?.Id,
                projectMemberIds,
                new
                {
                    TicketSerial = taskToUpdate.Serial.ToString(),
                    TicketId = taskToUpdate.Id.ToString(),
                    Description = taskDescription,
                    ProjectName = originalTask.Project?.Name ?? "",
                    ProjectId = originalTask.Project?.Id.ToString() ?? ""
                },
                cancellationToken);
        }
    }

    #endregion
}
