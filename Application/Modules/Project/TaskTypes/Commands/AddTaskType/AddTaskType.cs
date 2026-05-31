using Finbuckle.MultiTenant.Abstractions;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Project.TaskTypes.Commands.AddTaskType;

public record AddTaskTypeCommand : IRequest<Result<AddTaskTypeResponse>>
{
    public LocalizableTextInputDto? Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddTaskTypeCommand, Novologs.Domain.Entities.ProjectTaskType>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
            ;
        }
    }
}

public class AddTaskTypeResponse
{
    public Guid Id { get; set; }
}

public class AddTaskTypeCommandValidator : AbstractValidator<AddTaskTypeCommand>
{
    public AddTaskTypeCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Name)
            .NotNull().WithMessage("Name is required.");
        RuleFor(v => v.Name!.Value)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");
        RuleFor(v => v.Name)
            .MustAsync(async (name, cancellationToken) =>
            {
                if (name == null) return true;
                return !await context.GetSet<ProjectTaskType>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower(),
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class AddTaskTypeCommandHandler : IRequestHandler<AddTaskTypeCommand, Result<AddTaskTypeResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;
    
    public AddTaskTypeCommandHandler(ITenantDbContext context, IMapper mapper, SendEmailAndNotificationService sendEmailAndNotificationService, IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor)
    {
        _context = context;
        _mapper = mapper;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<AddTaskTypeResponse>> Handle(AddTaskTypeCommand request,
        CancellationToken cancellationToken)
    {
        var projectTaskType = _mapper.Map<ProjectTaskType>(request);
        await _context.GetSet<ProjectTaskType>().AddAsync(projectTaskType, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
            // if (toAdd.Any())
            // {
            //     var members = await _context.GetSet<TenantUser>().Where(m => toAdd.Contains(m.Id))
            //         .ToListAsync(cancellationToken);
            //     var emailData = new EmailData()
            //     {
            //         TenantId = tenantInfo?.Id,
            //         EmailTemplate = EmailTemplate.NotificationEmail,
            //         UserInfo =
            //             members.Select(m => new EmailUserInfo() { Email = m.Email!, FirstName = m.FullName, Id = m.Id })
            //                 .ToList(),
            //         Subject = $"You have been added to TaskType {projectTaskType.Code} - {projectTaskType.Name}",
            //         Message =
            //             $"You have been added as a member to the task type '{projectTaskType.Name}'.",
            //         Data = new Dictionary<string, string>()
            //     };
            //     emailData.Data.Add("TaskTypeName", projectTaskType.Name);
            //     emailData.Data.Add("TaskTypeId", project.Id.ToString());
            //     _sendEmailAndNotificationService.SendEmail(emailData);

            //     var notificationData = new NotificationData()
            //     {
            //         TenantId = tenantInfo?.Id,
            //         UserIds = toAdd,
            //         Type = NotificationType.AddedToProject,
            //         Title = $"You have been added to Project {project.Code} - {project.Name}",
            //         Body =
            //             $"You have been added as a member to the project '{project.Name}'.",
            //         Data = new Dictionary<string, string>()
            //     };
            //     notificationData.Data.Add("TaskType", project.Name);
            //     notificationData.Data.Add("ProjectId", project.Id.ToString());
            //     _sendEmailAndNotificationService.SendNotification(notificationData);

            // }

        return Result<AddTaskTypeResponse>.Success(new AddTaskTypeResponse() { Id = projectTaskType.Id });
    }
}
