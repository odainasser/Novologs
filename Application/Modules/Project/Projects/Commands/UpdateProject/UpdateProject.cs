using Finbuckle.MultiTenant.Abstractions;
using Microsoft.Extensions.Logging;
using Novologs.Application.Modules.Project.Projects.Dto;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Project.Projects.Commands.UpdateProject;

public record UpdateProjectCommand : IRequest<Result<UpdateProjectResponse>>
{
    public Guid Id { get; set; }
    public ProjectType Type { get; set; } = ProjectType.Mission;

    public ProjectStatus? Status { get; set; }
    public ProjectLifeCycle? LifeCycle { get; set; }
    public string? Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; } = null!;
    public Guid? OverviewDocumentId { get; set; }
    public string? Color { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? ClientId { get; set; }
    public Guid? LeadId { get; set; }
    public Guid? VendorId { get; set; }
    public Guid? ContractId { get; set; }
    public Guid? GoalId { get; set; }
    public Guid? InitiativeId { get; set; }
    public List<Guid>? TaskTypeIds { get; set; }
    public List<ProjectModuleDto>? ModuleList { get; set; }

    public List<ProjectMemberDto>? MemberList { get; set; }
    
    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateProjectCommand, Novologs.Domain.Entities.Project>()
                .ForMember(dest => dest.Code, opt => opt.Condition(src => string.IsNullOrWhiteSpace(src.Code) == false))
                .ForMember(dest => dest.Description,
                    opt => opt.Condition(src => string.IsNullOrWhiteSpace(src.Description) == false))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type))
                .ForMember(dest => dest.Name, opt => opt.Condition(src => string.IsNullOrWhiteSpace(src.Name) == false))
                .ForMember(dest => dest.Color,
                    opt => opt.Condition(src => string.IsNullOrWhiteSpace(src.Color) == false))
                .ForMember(dest => dest.StartDate,
                    opt => opt.MapFrom(src =>
                        src.StartDate.HasValue ? src.StartDate.Value.ToUniversalTime() : (DateTime?)null))
                .ForMember(dest => dest.EndDate,
                    opt => opt.MapFrom(src =>
                        src.EndDate.HasValue ? src.EndDate.Value.ToUniversalTime() : (DateTime?)null))
                .ForMember(dest => dest.TaskTypes, opt => opt.Ignore())
                .ForMember(dest => dest.Modules, opt => opt.Ignore())
                .ForMember(dest => dest.ProjectMembers, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Condition(src => src.Status != null))
                .ForMember(dest => dest.LifeCycle, opt => opt.Condition(src => src.LifeCycle != null))
                .ForMember(dest => dest.OverviewDocumentId, opt => opt.Condition(src => src.OverviewDocumentId != null))
                ;
        }
    }
}

public class UpdateProjectResponse
{
}

public class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand, Result<UpdateProjectResponse>>
{
    private readonly ILogger<UpdateProjectCommandHandler> _logger;

    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;


    public UpdateProjectCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor,
        ILogger<UpdateProjectCommandHandler> logger     
    )
    {
        _context = context;
        _mapper = mapper;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
        _logger = logger;
    }

    public async Task<Result<UpdateProjectResponse>> Handle(UpdateProjectCommand request,
        CancellationToken cancellationToken)
    {
         _logger.LogInformation("UpdateProjectCommandHandler called for ProjectId: {ProjectId}", request.Id);
   
        var project = await _context.GetSet<Novologs.Domain.Entities.Project>()
            .Include(p => p.ProjectMembers)
            .Include(p => p.Modules)
            .Include(p => p.TaskTypes)
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (project == null)
        {
            _logger.LogWarning("Project not found for ProjectId: {ProjectId}", request.Id);
            return Result<UpdateProjectResponse>.Failure("Project_003", "Project not found");
        }

        // Track changes for notifications
        var originalStatus = project.Status;
        var originalOverviewDocumentId = project.OverviewDocumentId;

        var originalName = project.Name;
        var originalDescription = project.Description;
        var originalCode = project.Code;
            
        _mapper.Map(request, project);

        var TicketingOrProject = project.Type == ProjectType.Ticketing ? "Ticketing Category" : 
                                project.Type == ProjectType.Mission ? "Mission" : "Project";

        // Get tenant info once for all notifications
        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;

        #region map members

        if (request.TaskTypeIds != null)
        {
            var existingTaskTypes = project.TaskTypes.Select(tt => tt.ProjectTaskTypeId).ToList();
            var toRemove = existingTaskTypes.Except(request.TaskTypeIds).ToList();
            var toAdd = request.TaskTypeIds.Except(existingTaskTypes).ToList();

            foreach (var taskTypeId in toRemove)
            {
                await _context.GetSet<ProjectTaskTypeProject>()
                    .Where(tt => tt.ProjectId == project.Id && tt.ProjectTaskTypeId == taskTypeId)
                    .ExecuteDeleteAsync(cancellationToken);
            }

            foreach (var taskTypeId in toAdd)
            {
                await _context.GetSet<ProjectTaskTypeProject>()
                    .AddAsync(new ProjectTaskTypeProject { ProjectId = project.Id, ProjectTaskTypeId = taskTypeId },
                        cancellationToken);
            }
        }

        if (request.ModuleList != null)
        {
            var existingModules = project.Modules.Select(m => (Guid?)m.Id).ToList();
            var toRemove = existingModules.Except(request.ModuleList.Select(m => m.Id)).ToList();
            var toAdd = request.ModuleList.Select(m => m.Id).Except(existingModules).ToList();

            foreach (var moduleId in toRemove)
            {
                await _context.GetSet<ProjectModule>()
                    .Where(m => m.ProjectId == project.Id && m.Id == moduleId)
                    .ExecuteDeleteAsync(cancellationToken);
            }

            foreach (var moduleId in toAdd)
            {
                var moduleDto = request.ModuleList.First(m => m.Id == moduleId);
                var newModule = _mapper.Map<ProjectModule>(moduleDto);
                newModule.ProjectId = project.Id;
                await _context.GetSet<ProjectModule>()
                    .AddAsync(newModule, cancellationToken);
            }

            foreach (var moduleDto in request.ModuleList.Where(m => existingModules.Contains(m.Id)))
            {
                var existingModule = project.Modules.First(m => m.Id == moduleDto.Id);
                _mapper.Map(moduleDto, existingModule);
            }
        }

        if (request.MemberList != null)
        {
            var existingMembers = project.ProjectMembers.Select(m => m.MemberId).ToList();
            var toRemove = existingMembers.Except(request.MemberList.Select(m => m.MemberId)).ToList();
            var toAdd = request.MemberList.Select(m => m.MemberId).Except(existingMembers).ToList();

            foreach (var memberId in toRemove)
            {
                await _context.GetSet<ProjectMember>()
                    .Where(m => m.ProjectId == project.Id && m.MemberId == memberId)
                    .ExecuteDeleteAsync(cancellationToken);
            }

            foreach (var memberId in toAdd)
            {
                var memberDto = request.MemberList.First(m => m.MemberId == memberId);
                var newMember = _mapper.Map<ProjectMember>(memberDto);
                newMember.ProjectId = project.Id;
                await _context.GetSet<ProjectMember>()
                    .AddAsync(newMember, cancellationToken);
            }

            foreach (var memberDto in request.MemberList.Where(m => existingMembers.Contains(m.MemberId)))
            {
                var existingMember = project.ProjectMembers.First(m => m.MemberId == memberDto.MemberId);
                existingMember.isOwner = memberDto.isOwner;
            }

            if (toAdd.Any())
            {
                var members = await _context.GetSet<TenantUser>().Where(m => toAdd.Contains(m.Id)).ToListAsync(cancellationToken);
                var emailData = new EmailData()
                {
                    TenantId = tenantInfo?.Id,
                    EmailTemplate = EmailTemplate.NotificationEmail,
                    UserInfo =
                        members.Select(m => new EmailUserInfo() { Email = m.Email!, FirstName = m.FullName, Id = m.Id })
                            .ToList(),
                    Subject = $"You have been added to {TicketingOrProject} {project.Code} - {project.Name}",
                    Message =
                        $"You have been added as a member to the {TicketingOrProject.ToLower()} '{project.Name}'.",
                    Data = new Dictionary<string, string>()
                };
                emailData.Data.Add("ProjectName", project.Name);
                emailData.Data.Add("ProjectId", project.Id.ToString());
                _sendEmailAndNotificationService.SendEmail(emailData);

                var notificationData = new NotificationData()
                {
                    TenantId = tenantInfo?.Id,
                    UserIds = toAdd,
                    Type = NotificationType.AddedToProject,
                    Title = $"You have been added to {TicketingOrProject} {project.Code} - {project.Name}",
                    Body =
                        $"You have been added as a member to the {TicketingOrProject.ToLower()} '{project.Name}'.",
                    Data = new Dictionary<string, string>()
                };
                notificationData.Data.Add("ProjectName", project.Name);
                notificationData.Data.Add("ProjectId", project.Id.ToString());
                _sendEmailAndNotificationService.SendNotification(notificationData);
            }

            if (toRemove.Any())
            {
                var members = await _context.GetSet<TenantUser>().Where(m => toRemove.Contains(m.Id))
                    .ToListAsync(cancellationToken);
                var emailData = new EmailData()
                {
                    TenantId = tenantInfo?.Id,
                    EmailTemplate = EmailTemplate.NotificationEmail,
                    UserInfo =
                        members.Select(m => new EmailUserInfo() { Email = m.Email!, FirstName = m.FullName, Id = m.Id })
                            .ToList(),
                    Subject = $"You have been removed from {TicketingOrProject} {project.Code} - {project.Name}",
                    Message =
                        $"You have been removed as a member from the {TicketingOrProject.ToLower()} '{project.Name}'.",
                    Data = new Dictionary<string, string>()
                };
                emailData.Data.Add("ProjectName", project.Name);
                emailData.Data.Add("ProjectId", project.Id.ToString());
                _sendEmailAndNotificationService.SendEmail(emailData);


                var notificationData = new NotificationData()
                {
                    TenantId = tenantInfo?.Id,
                    UserIds = toRemove,
                    Type = NotificationType.RemovedFromProject,
                    Title = $"You have been removed from {TicketingOrProject} {project.Code} - {project.Name}",
                    Body =
                        $"You have been removed as a member from the {TicketingOrProject.ToLower()} '{project.Name}'.",
                    Data = new Dictionary<string, string>()
                };
                notificationData.Data.Add("ProjectName", project.Name);
                notificationData.Data.Add("ProjectId", project.Id.ToString());
                _sendEmailAndNotificationService.SendNotification(notificationData);
            }

            var toNotify = existingMembers.Except(toRemove).ToList();
            if (toNotify.Any())
            {
                var notificationData = new NotificationData()
                {
                    TenantId = tenantInfo?.Id,
                    UserIds = toNotify,
                    Type = NotificationType.EditedProject,
                    Title = $"{TicketingOrProject} Updated {project.Code} - {project.Name}",
                    Body = $"The {TicketingOrProject.ToLower()} '{project.Name}' has been updated.",
                    Data = new Dictionary<string, string>()
                };
                notificationData.Data.Add("ProjectName", project.Name);
                notificationData.Data.Add("ProjectId", project.Id.ToString());
                _sendEmailAndNotificationService.SendNotification(notificationData);
            }
        }

            #endregion

            // NEW: Send notifications when project details are updated (not just members)
        var projectDetailsChanged = originalName != project.Name || 
                                    originalDescription != project.Description || 
                                    originalCode != project.Code;
        
       

       
        if (projectDetailsChanged )
        {
            // Project details were updated but members weren't changed
            var allMemberIds = project.ProjectMembers.Select(m => m.MemberId).ToList();
            if (allMemberIds.Any())
            {
                _logger.LogWarning("Project details were updated but members weren't changed for ProjectId: {ProjectId}", project.Id);
           
                var members = await _context.GetSet<TenantUser>()
                    .Where(m => allMemberIds.Contains(m.Id))
                    .ToListAsync(cancellationToken);

                var emailData = new EmailData()
                {
                    TenantId = tenantInfo?.Id,
                    EmailTemplate = EmailTemplate.NotificationEmail,
                    UserInfo = members.Select(m => new EmailUserInfo() 
                    { 
                        Email = m.Email!, 
                        FirstName = m.FullName, 
                        Id = m.Id 
                    }).ToList(),
                    Subject = $"{TicketingOrProject} Updated: {project.Code} - {project.Name}",
                    Message = $"The {TicketingOrProject.ToLower()} '{project.Name}' has been updated.",
                    Data = new Dictionary<string, string>()
                };
                emailData.Data.Add("ProjectName", project.Name);
                emailData.Data.Add("ProjectId", project.Id.ToString());
                _sendEmailAndNotificationService.SendEmail(emailData);

                var notificationData = new NotificationData()
                {
                    TenantId = tenantInfo?.Id,
                    UserIds = allMemberIds,
                    Type = NotificationType.EditedProject,
                    Title = $"{TicketingOrProject} Updated: {project.Code} - {project.Name}",
                    Body = $"The {TicketingOrProject.ToLower()} '{project.Name}' has been updated.",
                    Data = new Dictionary<string, string>()
                };
                notificationData.Data.Add("ProjectName", project.Name);
                notificationData.Data.Add("ProjectId", project.Id.ToString());
                _sendEmailAndNotificationService.SendNotification(notificationData);

                _logger.LogWarning("Email and notification sent for project details update to members of ProjectId: {ProjectId}", project.Id);
            }
        }
 

        // Send notifications for Status changes
       else if (request.Status.HasValue && originalStatus != project.Status)
        {
            var allMemberIds = project.ProjectMembers.Select(m => m.MemberId).ToList();
            if (allMemberIds.Any())
            {
                var members = await _context.GetSet<TenantUser>()
                    .Where(m => allMemberIds.Contains(m.Id))
                    .ToListAsync(cancellationToken);

                var emailData = new EmailData()
                {
                    TenantId = tenantInfo?.Id,
                    EmailTemplate = EmailTemplate.NotificationEmail,
                    UserInfo = members.Select(m => new EmailUserInfo() 
                    { 
                        Email = m.Email!, 
                        FirstName = m.FullName, 
                        Id = m.Id 
                    }).ToList(),
                    Subject = $"{TicketingOrProject} Status Changed: {project.Code} - {project.Name}",
                    Message = $"The status of {TicketingOrProject.ToLower()} '{project.Name}' has been changed from {originalStatus} to {project.Status}.",
                    Data = new Dictionary<string, string>()
                };
                emailData.Data.Add("ProjectName", project.Name);
                emailData.Data.Add("ProjectId", project.Id.ToString());
                emailData.Data.Add("OldStatus", originalStatus.ToString());
                emailData.Data.Add("NewStatus", project.Status.ToString());
                _sendEmailAndNotificationService.SendEmail(emailData);

                var notificationData = new NotificationData()
                {
                    TenantId = tenantInfo?.Id,
                    UserIds = allMemberIds,
                    Type = NotificationType.EditedProject,
                    Title = $"{TicketingOrProject} Status Changed",
                    Body = $"The status of '{project.Name}' has been changed to {project.Status}.",
                    Data = new Dictionary<string, string>()
                };
                notificationData.Data.Add("ProjectName", project.Name);
                notificationData.Data.Add("ProjectId", project.Id.ToString());
                notificationData.Data.Add("NewStatus", project.Status.ToString());
                _sendEmailAndNotificationService.SendNotification(notificationData);
            }
        }

        // Send notifications for Overview Document changes
       else if (request.OverviewDocumentId.HasValue && originalOverviewDocumentId != project.OverviewDocumentId)
        {
            var allMemberIds = project.ProjectMembers.Select(m => m.MemberId).ToList();
            if (allMemberIds.Any())
            {
                var members = await _context.GetSet<TenantUser>()
                    .Where(m => allMemberIds.Contains(m.Id))
                    .ToListAsync(cancellationToken);

                var emailData = new EmailData()
                {
                    TenantId = tenantInfo?.Id,
                    EmailTemplate = EmailTemplate.NotificationEmail,
                    UserInfo = members.Select(m => new EmailUserInfo() 
                    { 
                        Email = m.Email!, 
                        FirstName = m.FullName, 
                        Id = m.Id 
                    }).ToList(),
                    Subject = $"{TicketingOrProject} Overview Document Updated: {project.Code} - {project.Name}",
                    Message = $"The overview document for {TicketingOrProject.ToLower()} '{project.Name}' has been {(originalOverviewDocumentId.HasValue ? "updated" : "added")}.",
                    Data = new Dictionary<string, string>()
                };
                emailData.Data.Add("ProjectName", project.Name);
                emailData.Data.Add("ProjectId", project.Id.ToString());
                emailData.Data.Add("OverviewDocumentId", project.OverviewDocumentId?.ToString() ?? "");
                _sendEmailAndNotificationService.SendEmail(emailData);

                var notificationData = new NotificationData()
                {
                    TenantId = tenantInfo?.Id,
                    UserIds = allMemberIds,
                    Type = NotificationType.EditedProject,
                    Title = $"{TicketingOrProject} Overview Document {(originalOverviewDocumentId.HasValue ? "Updated" : "Added")}",
                    Body = $"The overview document for '{project.Name}' has been {(originalOverviewDocumentId.HasValue ? "updated" : "added")}.",
                    Data = new Dictionary<string, string>()
                };
                notificationData.Data.Add("ProjectName", project.Name);
                notificationData.Data.Add("ProjectId", project.Id.ToString());
                notificationData.Data.Add("OverviewDocumentId", project.OverviewDocumentId?.ToString() ?? "");
                _sendEmailAndNotificationService.SendNotification(notificationData);
            }
        }

        _context.GetSet<Novologs.Domain.Entities.Project>().Update(project);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateProjectResponse>.Success(new UpdateProjectResponse());
    }
}
