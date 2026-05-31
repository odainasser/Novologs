using Finbuckle.MultiTenant.Abstractions;
using Hangfire;
using MessageTemplates.Services;
using Novologs.Application.Modules.Tasks.Services;
using Microsoft.Extensions.Logging;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;
using SystemLoaders.Services;
using Novologs.Application.Common.Helpers;
using Novologs.Application.Tenant;

namespace Novologs.Application.Modules.Tasks.Tasks.Commands.CreateTask;

public record CreateTaskCommand : IRequest<Result<CreateTaskResponse>>
{
    public string? Code { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid? MileStoneId { get; set; }
    public Guid? ClientId { get; set; }
    public Guid? ClientLeadId { get; set; }
    public Guid? VendorId { get; set; }
    public Guid? VendorContractId { get; set; }

    public Guid? DocumentId { get; set; }
    public string? Description { get; set; }
    public List<Guid> MembersIds { get; set; } = new();
    public bool IsConfidential { get; set; }
    public bool IsAssignedToMe { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? PriorityId { get; set; }
    public Guid? ParentTaskId { get; set; }

    public Guid? AudioFileId { get; set; }

    public bool IsChatMessage { get; set; }
    public Guid? ChatMessageId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<CreateTaskCommand, Novologs.Domain.Entities.ProjectTask>()
                .ForMember(dest => dest.Members, opt => opt.Ignore())
                .ForMember(dest => dest.StartDate,
                    opt => opt.MapFrom(src =>
                        src.StartDate.HasValue ? src.StartDate.Value.ToUniversalTime() : (DateTime?)null))
                .ForMember(dest => dest.EndDate,
                    opt => opt.MapFrom(src =>
                        src.EndDate.HasValue ? src.EndDate.Value.ToUniversalTime() : (DateTime?)null));
            ;
        }
    }
}

public class CreateTaskResponse
{
    public Guid Id { get; set; }
}

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, Result<CreateTaskResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly INotificationService _notificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;
    private readonly IVoiceProcessingService _voiceProcessingService;
    private readonly ILogger<CreateTaskCommandHandler> _logger;
    
    public CreateTaskCommandHandler(
        ITenantDbContext context,
        IUser user,
        IMapper mapper,
        INotificationService notificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor,
        IVoiceProcessingService voiceProcessingService,
        ILogger<CreateTaskCommandHandler> logger
    )
    {
        _context = context;
        _user = user;
        _mapper = mapper;
        _notificationService = notificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
        _voiceProcessingService = voiceProcessingService;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task<Result<CreateTaskResponse>> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = Guid.Parse(_user.Id!);
        
        _logger.LogInformation("[DEBUG] CreateTaskCommandHandler.Handle called - ProjectId: {ProjectId}, Code: {Code}", 
            request.ProjectId, request.Code);

        // Pre-fetch independent lookups sequentially before the main flow
        var notStartedStatusId = await _context.GetSet<Novologs.Domain.Entities.TaskStatus>()
            .Where(s => s.Status == ProjectTaskStatus.NotStarted)
            .Select(s => s.Id)
            .FirstOrDefaultAsync(cancellationToken);

        var generalTasksFolderId = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .Where(f => f.Type == FolderType.General && f.Name == Constants.FolderNames.Tasks)
            .Select(f => (Guid?)f.Id)
            .FirstOrDefaultAsync(cancellationToken);

        // Validate and load project
        var project = await ValidateAndLoadProject(request.ProjectId, currentUserId, cancellationToken);
        if (project == null && request.ProjectId.HasValue)
        {
            return Result<CreateTaskResponse>.Failure("Task_002", "Project not found.");
        }

        var isTicketingProject = project?.Type == ProjectType.Ticketing;
        
        // Create and initialize task (uses pre-fetched notStartedStatusId)
        var task = await CreateAndInitializeTask(request, currentUserId, notStartedStatusId, cancellationToken);
        
        await _context.GetSet<Novologs.Domain.Entities.ProjectTask>().AddAsync(task, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("[DEBUG] Task saved - Serial: {Serial}, Code: {Code}, IsTicketingProject: {IsTicketing}, ProjectId: {ProjectId}", 
            task.Serial, task.Code, isTicketingProject, request.ProjectId);

        // Link to chat message if requested â€” batched with folder save below
        if (request.IsChatMessage && request.ChatMessageId.HasValue)
        {
            var chatMessageTask = new Novologs.Domain.Entities.ChatMessageTask
            {
                ChatMessageId = request.ChatMessageId.Value,
                TaskId = task.Id
            };
            await _context.GetSet<Novologs.Domain.Entities.ChatMessageTask>().AddAsync(chatMessageTask, cancellationToken);
        }

        // Create task folder entity and batch save with chatMessageTask
        var taskFolderId = CreateTaskFolderEntity(task, generalTasksFolderId);
        await _context.SaveChangesAsync(cancellationToken);

        // Send creation notifications
        await SendCreationNotifications(task, project, currentUserId, isTicketingProject, cancellationToken);

        // Process voice file (audio transcription) only when an audio file is provided
        if (request.AudioFileId.HasValue)
        {
            await ProcessVoiceFile(task, request.AudioFileId.Value, taskFolderId, cancellationToken);
        }

        return Result<CreateTaskResponse>.Success(new CreateTaskResponse { Id = task.Id });
    }

    #region Helper Methods

    private async System.Threading.Tasks.Task<Novologs.Domain.Entities.Project?> ValidateAndLoadProject(
        Guid? projectId, 
        Guid currentUserId, 
        CancellationToken cancellationToken)
    {
        if (!projectId.HasValue) return null;

        var project = await _context.GetSet<Novologs.Domain.Entities.Project>()
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == projectId.Value, cancellationToken);

        if (project == null) return null;

        if (project.Type != ProjectType.Ticketing)
        {
            var isMember = await _context.GetSet<ProjectMember>()
                .AnyAsync(pm => pm.ProjectId == projectId.Value && pm.MemberId == currentUserId, cancellationToken);

            if (!isMember)
            {
                throw new UnauthorizedAccessException("You are not a member of this project.");
            }
        }

        return project;
    }

    private async System.Threading.Tasks.Task<Novologs.Domain.Entities.ProjectTask> CreateAndInitializeTask(
        CreateTaskCommand request, 
        Guid currentUserId,
        Guid notStartedStatusId,
        CancellationToken cancellationToken)
    {
        var task = _mapper.Map<Novologs.Domain.Entities.ProjectTask>(request);
        task.CommentThread = new();
        task.CreatorId = currentUserId;
        task.StatusId = notStartedStatusId;

        // Store description as structured JSON without calling Gemini
        if (!string.IsNullOrEmpty(task.Description))
        {
            task.Description = System.Text.Json.JsonSerializer.Serialize(
                new TaskVoiceFileData { TranscriptStr = task.Description });
        }

        task.Members = request.MembersIds
            .Select(memberId => new ProjectTaskMember(Guid.NewGuid()) { MemberId = memberId, StatusId = notStartedStatusId })
            .ToList();
        if (request.IsAssignedToMe && _user.Id != null)
        {
            task.Members.Add(new ProjectTaskMember(Guid.NewGuid()) { MemberId = _user.IdGuid, StatusId = notStartedStatusId });
        }
        
        task.TimeLines.Add(new ProjectTaskTimeLine
        {
            CreatorId = task.CreatorId, 
            Description = "Task Created", 
            Date = DateTime.UtcNow
        });

        await AddMemberTimelines(task, currentUserId, cancellationToken);

        return task;
    }

    private async System.Threading.Tasks.Task AddMemberTimelines(
        Novologs.Domain.Entities.ProjectTask task, 
        Guid currentUserId, 
        CancellationToken cancellationToken)
    {
        var memberIdsForTimeline = task.Members?.Select(m => m.MemberId)
            .Where(id => id != currentUserId)
            .ToList() ?? new List<Guid?>();
        
        if (!memberIdsForTimeline.Any()) return;

        // Combine creator + member lookups into one query
        var allIds = memberIdsForTimeline.Select(id => id!.Value)
            .Concat(new[] { currentUserId })
            .Distinct()
            .ToList();
        var userNames = await _context.GetSet<TenantUser>().AsNoTracking()
            .Where(u => allIds.Contains(u.Id))
            .Select(u => new { u.Id, u.FullName })
            .ToDictionaryAsync(u => u.Id, u => u.FullName, cancellationToken);

        var creatorName = userNames.TryGetValue(currentUserId, out var cn) ? cn : "";

        foreach (var memberId in memberIdsForTimeline)
        {
            if (memberId.HasValue && userNames.TryGetValue(memberId.Value, out var memberName))
            {
                task.TimeLines.Add(new ProjectTaskTimeLine
                {
                    CreatorId = currentUserId,
                    Description = $"{creatorName} added {memberName} to the task.",
                    Date = DateTime.UtcNow
                });
            }
        }
    }

    private async System.Threading.Tasks.Task SendCreationNotifications(
        Novologs.Domain.Entities.ProjectTask task,
        Novologs.Domain.Entities.Project? project,
        Guid currentUserId,
        bool isTicketingProject,
        CancellationToken cancellationToken)
    {
        var descriptionText = TaskVoiceFileData.GetDescriptionFromJson(task.Description, preferArabic: false);
        
        if (isTicketingProject)
        {
            await SendTicketCreationNotifications(task, project, currentUserId, descriptionText, cancellationToken);
        }
        else
        {
            await SendTaskCreationNotifications(task, descriptionText, cancellationToken);
        }
    }

    private async System.Threading.Tasks.Task SendTaskCreationNotifications(
        Novologs.Domain.Entities.ProjectTask task,
        string descriptionText,
        CancellationToken cancellationToken)
    {
        var membersIds = task.Members?.Select(ms => ms.MemberId)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .ToList() ?? new List<Guid>();
        membersIds.Remove(task.CreatorId);

        if (!membersIds.Any()) return;

        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;

        await _notificationService.SendNotificationWithUserLanguages(
            _context,
            MessageType.TaskCreated,
            tenantInfo?.Id,
            membersIds,
            new
            {
                TaskSerial = task.Serial.ToString(),
                TaskId = task.Id.ToString(),
                Description = descriptionText
            },
            cancellationToken);
    }

    private async System.Threading.Tasks.Task SendTicketCreationNotifications(
        Novologs.Domain.Entities.ProjectTask task,
        Novologs.Domain.Entities.Project? project,
        Guid currentUserId,
        string descriptionText,
        CancellationToken cancellationToken)
    {
        if (project == null) return;

        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;

        // Query project member IDs directly (navigation property is not eagerly loaded)
        var projectMemberIds = await _context.GetSet<ProjectMember>()
            .AsNoTracking()
            .Where(pm => pm.ProjectId == project.Id && pm.MemberId != currentUserId)
            .Select(pm => pm.MemberId)
            .ToListAsync(cancellationToken);

        if (!projectMemberIds.Any()) return;

        await _notificationService.SendNotificationWithUserLanguages(
            _context,
            MessageType.TicketCreated,
            tenantInfo?.Id,
            projectMemberIds,
            new
            {
                TicketSerial = task.Serial.ToString(),
                TicketId = task.Id.ToString(),
                Description = descriptionText,
                ProjectName = project?.Name ?? "",
                ProjectId = project?.Id.ToString() ?? ""
            },
            cancellationToken);
    }

    private Guid? CreateTaskFolderEntity(
        Novologs.Domain.Entities.ProjectTask task,
        Guid? generalTasksFolderId)
    {
        if (!generalTasksFolderId.HasValue) return null;

        var taskFolder = new Novologs.Domain.Entities.Folder(Guid.NewGuid())
        {
            Name = task.Serial.ToString(),
            Type = FolderType.SystemGenerated,
            ParentFolderId = generalTasksFolderId.Value,
            IsFile = false,
            CreatorId = task.CreatorId,
            TaskId = task.Id
        };

        _context.GetSet<Novologs.Domain.Entities.Folder>().Add(taskFolder);
        return taskFolder.Id;
    }

    private async System.Threading.Tasks.Task ProcessTaskDescription(
        Novologs.Domain.Entities.ProjectTask task,
        Guid? audioFileId,
        Guid? taskFolderId,
        Novologs.Domain.Entities.Project? project,
        Guid currentUserId,
        bool isTicketingProject,
        CancellationToken cancellationToken)
    {
        if (audioFileId.HasValue)
        {
            await ProcessVoiceFile(task, audioFileId.Value, taskFolderId, cancellationToken);
        }
        else
        {
            await ProcessTextDescription(task, project, currentUserId, isTicketingProject, cancellationToken);
        }
    }

    private async System.Threading.Tasks.Task ProcessVoiceFile(
        Novologs.Domain.Entities.ProjectTask task,
        Guid audioFileId,
        Guid? taskFolderId,
        CancellationToken cancellationToken)
    {
        var voiceFile = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .FirstOrDefaultAsync(f => f.Id == audioFileId, cancellationToken);
        
        if (voiceFile == null || !voiceFile.IsFile) return;

        // Use the already-known taskFolderId instead of re-querying
        if (taskFolderId.HasValue)
        {
            voiceFile.ParentFolderId = taskFolderId.Value;
            task.AudioFileId = voiceFile.Id;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async System.Threading.Tasks.Task ProcessTextDescription(
        Novologs.Domain.Entities.ProjectTask task,
        Novologs.Domain.Entities.Project? project,
        Guid currentUserId,
        bool isTicketingProject,
        CancellationToken cancellationToken)
    {
        var taskDataFromText = await _voiceProcessingService.ProcessTaskTextAsync(task.Description ?? "");
        if (taskDataFromText == null)
        {
            taskDataFromText = new TaskVoiceFileData() { TranscriptStr = task.Description };
        }

        task.Description = System.Text.Json.JsonSerializer.Serialize(taskDataFromText);
        await _context.SaveChangesAsync(cancellationToken);

        // Send description update notifications
        // if (isTicketingProject)
        // {
        //     await SendTicketDescriptionUpdateNotifications(task, project, currentUserId, cancellationToken);
        // }
        // else
        // {
        //     await SendTaskDescriptionUpdateNotifications(task, cancellationToken);
        // }
    }

    private async System.Threading.Tasks.Task SendTaskDescriptionUpdateNotifications(
        Novologs.Domain.Entities.ProjectTask task,
        CancellationToken cancellationToken)
    {
        var toNotifyIds = task.Members?.Select(m => m.MemberId)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .ToList() ?? new List<Guid>();
        toNotifyIds.Add(task.CreatorId);
        toNotifyIds = toNotifyIds.Distinct().ToList();

        _logger.LogInformation("[CreateTask] Preparing notifications for Task {TaskSerial}: Members to notify: {MemberIds}",
            task.Serial, string.Join(", ", toNotifyIds));

        if (!toNotifyIds.Any()) return;

        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        var updatedDescriptionText = TaskVoiceFileData.GetDescriptionFromJson(task.Description, preferArabic: false);

        await _notificationService.SendNotificationWithUserLanguages(
            _context,
            MessageType.TaskUpdated,
            tenantInfo?.Id,
            toNotifyIds,
            new
            {
                TaskSerial = task.Serial.ToString(),
                TaskId = task.Id.ToString(),
                Description = updatedDescriptionText
            },
            cancellationToken);
    }

    private async System.Threading.Tasks.Task SendTicketDescriptionUpdateNotifications(
        Novologs.Domain.Entities.ProjectTask task,
        Novologs.Domain.Entities.Project? project,
        Guid currentUserId,
        CancellationToken cancellationToken)
    {
        var projectMemberIds = project?.ProjectMembers
            ?.Select(pm => pm.MemberId)
            .Distinct()
            .ToList() ?? new List<Guid>();

        if (!projectMemberIds.Any()) return;

        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        var updatedDescriptionText = TaskVoiceFileData.GetDescriptionFromJson(task.Description, preferArabic: false);

        await _notificationService.SendNotificationWithUserLanguages(
            _context,
            MessageType.TicketUpdated,
            tenantInfo?.Id,
            projectMemberIds,
            new
            {
                TicketSerial = task.Serial.ToString(),
                TicketId = task.Id.ToString(),
                Description = updatedDescriptionText,
                ProjectName = project?.Name ?? "",
                ProjectId = project?.Id.ToString() ?? ""
            },
            cancellationToken);
    }

    #endregion
}
