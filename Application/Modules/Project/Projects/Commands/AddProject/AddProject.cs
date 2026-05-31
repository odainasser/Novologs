using System.Security.Claims;
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Http;
using Novologs.Application.Modules.Project.Projects.Dto;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Tenant;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Project.Projects.Commands.AddProject;

public record AddProjectCommand : IRequest<Result<AddProjectResponse>>
{
    public ProjectType Type { get; set; } = ProjectType.Mission;

    public ProjectStatus Status { get; set; }
    public ProjectLifeCycle LifeCycle { get; set; }
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
            CreateMap<AddProjectCommand, Novologs.Domain.Entities.Project>()
                .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.Code))
                .AfterMap((src, dest, context) =>
                {
                    if (src.TaskTypeIds != null)
                    {
                        dest.TaskTypes = src.TaskTypeIds.Select(taskTypeId =>
                            new ProjectTaskTypeProject { ProjectTaskTypeId = taskTypeId }).ToList();
                    }

                    if (src.ModuleList != null)
                    {
                        dest.Modules = context.Mapper.Map<List<Novologs.Domain.Entities.ProjectModule>>(src.ModuleList);
                    }


                    if (src.MemberList != null)
                    {
                        dest.ProjectMembers = src.MemberList
                            .Select(member =>
                                new ProjectMember { MemberId = member.MemberId, isOwner = member.isOwner })
                            .ToList();
                    }
                })
                .ForMember(dest => dest.StartDate,
                    opt => opt.MapFrom(src =>
                        src.StartDate.HasValue ? src.StartDate.Value.ToUniversalTime() : (DateTime?)null))
                .ForMember(dest => dest.EndDate,
                    opt => opt.MapFrom(src =>
                        src.EndDate.HasValue ? src.EndDate.Value.ToUniversalTime() : (DateTime?)null))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description ?? ""))
                ;
        }
    }
}

public class AddProjectResponse
{
    public Guid Id { get; set; }
}

public class AddProjectCommandHandler : IRequestHandler<AddProjectCommand, Result<AddProjectResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public AddProjectCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor
    )
    {
        _context = context;
        _mapper = mapper;
        _httpContextAccessor = httpContextAccessor;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<AddProjectResponse>> Handle(AddProjectCommand request, CancellationToken cancellationToken)
    {
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (request.MemberList?.Where(ms => ms.isOwner).Any() != true)
        {
            var memberList = new List<ProjectMemberDto> { };
            memberList.Add(new ProjectMemberDto() { MemberId = Guid.Parse(userId!), isOwner = true });
            if (request.MemberList?.Any() == true)
            {
                memberList.AddRange(request.MemberList);
            }
            
            request.MemberList = memberList;
        }

        var project = _mapper.Map<Novologs.Domain.Entities.Project>(request);
        project.CreatorId = Guid.Parse(userId!);

        // Pre-fetch folder before any save â€” avoids a second SaveChangesAsync
        var targetFolderName = project.Type == ProjectType.Mission ? Constants.FolderNames.Missions : Constants.FolderNames.Projects;
        var generalProjectsFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .FirstOrDefaultAsync(f => f.Type == FolderType.General && f.Name == targetFolderName,
                cancellationToken);

        if (generalProjectsFolder != null)
        {
            var projectFolder = new Novologs.Domain.Entities.Folder(Guid.NewGuid())
            {
                Name = project.Name,
                Type = FolderType.Shared,
                ParentFolderId = generalProjectsFolder.Id,
                IsFile = false,
                CreatorId = project.CreatorId
            };
            if (project.Type == ProjectType.Mission)
            {
                projectFolder.MissionId = project.Id;
            }
            else
            {
                projectFolder.ProjectId = project.Id;
            }
            await _context.GetSet<Novologs.Domain.Entities.Folder>().AddAsync(projectFolder, cancellationToken);
        }

        await _context.GetSet<Novologs.Domain.Entities.Project>().AddAsync(project, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Use already-tracked members instead of re-querying from DB
        var projectMembers = project.ProjectMembers ?? new List<ProjectMember>();
        if (projectMembers.Any())
        {
            var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
            var membersIds = projectMembers.Select(ms => ms.MemberId).ToList();
            var members = await _context.GetSet<TenantUser>().Where(m => membersIds.Contains(m.Id))
                .ToListAsync(cancellationToken);
                
            var TicketingOrProject = project.Type == ProjectType.Ticketing ? "Ticket Category" : 
                                     project.Type == ProjectType.Mission ? "Mission" : "Project";
                
            var emailData = new EmailData()
            {
                TenantId = tenantInfo?.Id,
                EmailTemplate = EmailTemplate.NotificationEmail,
                UserInfo =
                    members.Select(m => new EmailUserInfo() { Email = m.Email!, FirstName = m.FullName, Id = m.Id })
                        .ToList(),
                Subject = $"New {TicketingOrProject} Created {project.Code} - {project.Name}",
                Message =
                    $"A new {TicketingOrProject.ToLower()} '{project.Name}' has been created. You have been added as a member of this {TicketingOrProject.ToLower()}.",
                Data = new Dictionary<string, string>()
            };
            emailData.Data.Add("ProjectName", project.Name);
            emailData.Data.Add("ProjectId", project.Id.ToString());
            _sendEmailAndNotificationService.SendEmail(emailData);

            //send notification
            var notificationData = new NotificationData()
            {
                TenantId = tenantInfo?.Id,
                UserIds = membersIds,
                Type = NotificationType.AddedToProject,
                Title = $"New {TicketingOrProject} Created {project.Code} - {project.Name}",
                Body =
                    $"A new {TicketingOrProject.ToLower()} '{project.Name}' has been created. You have been added as a member of this {TicketingOrProject.ToLower()}.",
                Data = new Dictionary<string, string>()
            };
            notificationData.Data.Add("ProjectName", project.Name);
            notificationData.Data.Add("ProjectId", project.Id.ToString());
            _sendEmailAndNotificationService.SendNotification(notificationData);
        }

        return Result<AddProjectResponse>.Success(new AddProjectResponse() { Id = project.Id });
    }
}
