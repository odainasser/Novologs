using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;
using Novologs.Domain.Entities;
using Finbuckle.MultiTenant.Abstractions;
using SystemLoaders.Services;
namespace Novologs.Application.Modules.Project.Projects.Commands.DeleteProject;

public record DeleteProjectCommand : IRequest<Result<DeleteProjectResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteProjectResponse
{
}

public class DeleteProjectCommandValidator : AbstractValidator<DeleteProjectCommand>
{
    public DeleteProjectCommandValidator()
    {
    }
}

public class DeleteProjectCommandHandler : IRequestHandler<DeleteProjectCommand, Result<DeleteProjectResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;
    public SendEmailAndNotificationService _sendEmailAndNotificationService;

    public DeleteProjectCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor,
        SendEmailAndNotificationService sendEmailAndNotificationService
    )
    {
        _context = context;
        _mapper = mapper;
        _multiTenantContextAccessor = multiTenantContextAccessor;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
    }

    public async Task<Result<DeleteProjectResponse>> Handle(DeleteProjectCommand request,
        CancellationToken cancellationToken)
    {
        var project = await _context.GetSet<Novologs.Domain.Entities.Project>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (project == null)
        {
            return Result<DeleteProjectResponse>.Failure("Project_002", "Project not found");
        }
 
        project.LifeCycle = ProjectLifeCycle.Archived;
        _context.GetSet<Novologs.Domain.Entities.Project>().Update(project);

        await _context.SaveChangesAsync(cancellationToken);

        var projectMembers = await _context.GetSet<ProjectMember>().Where(ms => ms.ProjectId == project.Id)
            .ToListAsync(cancellationToken);
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
                Subject = $"{TicketingOrProject} has been Deleted {project.Code} - {project.Name}",
                Message =
                    $"The {TicketingOrProject.ToLower()} '{project.Name}' has been deleted. You have been removed as a member of this {TicketingOrProject.ToLower()}.",
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
                Title = $"{TicketingOrProject} has been Deleted {project.Code} - {project.Name}",
                Body =
                    $"The {TicketingOrProject.ToLower()} '{project.Name}' has been deleted. You have been removed as a member of this {TicketingOrProject.ToLower()}.",
                Data = new Dictionary<string, string>()
            };
            notificationData.Data.Add("ProjectName", project.Name);
            notificationData.Data.Add("ProjectId", project.Id.ToString());
            _sendEmailAndNotificationService.SendNotification(notificationData);
        }

        return Result<DeleteProjectResponse>.Success(new DeleteProjectResponse());
    }
}
