using Finbuckle.MultiTenant.Abstractions;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Domain.Enums;

namespace Novologs.Application.UserGroups.Commands.UpdateUserGroup;

public record UpdateUserGroupCommand : IRequest<Result<UpdateUserGroupResponse>>
{
    public Guid Id { get; set; }
    public string? Name { get; set; } = null!;
    public string? Code { get; set; }
    public List<Guid>? MemberIds { get; set; } = new();

    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateUserGroupCommand, UserGroup>()
                .ForMember(dest => dest.Name, opt => opt.Condition(src => string.IsNullOrWhiteSpace(src.Name) == false))
                .ForMember(dest => dest.Code, opt => opt.Condition(src => string.IsNullOrWhiteSpace(src.Code) == false))
                .ForMember(dest => dest.Members, opt => opt.Ignore())
                ;
        }
    }
}

public class UpdateUserGroupResponse
{
}

public class UpdateUserGroupCommandValidator : AbstractValidator<UpdateUserGroupCommand>
{
    public UpdateUserGroupCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<UserGroup>().AnyAsync(ug => ug.Id == id, cancellationToken);
            })
            .WithMessage("User group not found.");

        RuleFor(v => v.Name)
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.")
            .MustAsync(async (command, name, cancellationToken) =>
            {
                if (string.IsNullOrWhiteSpace(name)) return true;
                return await context.GetSet<UserGroup>()
                    .AllAsync(l => l.Name.ToLower().Trim() != name.ToLower().Trim() || l.Id == command.Id,
                        cancellationToken);
            })
            .WithMessage("The specified name already exists.");

        RuleFor(v => v.Code)
            .MaximumLength(200).WithMessage("Code must not exceed 200 characters.")
            .MustAsync(async (command, code, cancellationToken) =>
            {
                if (string.IsNullOrWhiteSpace(code)) return true;
                return await context.GetSet<UserGroup>()
                    .AllAsync(
                        l => l.Code == null || l.Code.ToLower().Trim() != code.ToLower().Trim() || l.Id == command.Id,
                        cancellationToken);
            })
            .WithMessage("The specified code already exists.");

        RuleFor(v => v.MemberIds)
            .Must(memberIds => memberIds == null || memberIds.Distinct().Count() == memberIds.Count)
            .WithMessage("Member IDs must be unique.");

        RuleForEach(v => v.MemberIds)
            .MustAsync(async (memberId, cancellationToken) =>
            {
                return await context.GetSet<TenantUser>().AnyAsync(u => u.Id == memberId, cancellationToken);
            })
            .WithMessage("One or more member IDs are invalid.");
    }
}

public class UpdateUserGroupCommandHandler : IRequestHandler<UpdateUserGroupCommand, Result<UpdateUserGroupResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public UpdateUserGroupCommandHandler(
        ITenantDbContext context,
        IUser user,
        IMapper mapper,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<UpdateUserGroupResponse>> Handle(UpdateUserGroupCommand request,
        CancellationToken cancellationToken)
    {
        var entity = await _context.GetSet<UserGroup>()
            .Include(g => g.Members)
            .FirstOrDefaultAsync(ug => ug.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<UpdateUserGroupResponse>.Failure("UserGroup_001", "User group not found.");
        }

        _mapper.Map(request, entity);

        if (request.MemberIds != null)
        {
            var existingMemberIds = entity.Members.Select(m => m.UserId).ToList();
            var toRemove = existingMemberIds.Except(request.MemberIds).ToList();
            var toAdd = request.MemberIds.Except(existingMemberIds).ToList();

            foreach (var memberId in toRemove)
            {
                var memberToRemove = entity.Members.FirstOrDefault(m => m.UserId == memberId);
                if (memberToRemove != null)
                {
                    _context.GetSet<UserGroupMember>().Remove(memberToRemove);
                }
            }

            foreach (var memberId in toAdd)
            {
                _context.GetSet<UserGroupMember>().Add(new() { UserGroupId = entity.Id, UserId = memberId });
            }
        }

        _context.GetSet<UserGroup>().Update(entity);

        await _context.SaveChangesAsync(cancellationToken);

        // Send email and notification to all current members about the update
        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        var currentMemberIds = entity.Members.Select(m => m.UserId).ToList();
        
        if (currentMemberIds.Any())
        {
            var members = await _context.GetSet<TenantUser>()
                .Where(u => currentMemberIds.Contains(u.Id))
                .ToListAsync(cancellationToken);

            var emailData = new EmailData()
            {
                TenantId = tenantInfo?.Id,
                EmailTemplate = EmailTemplate.NotificationEmail,
                UserInfo = members.Select(m => new EmailUserInfo
                {
                    Email = m.Email!,
                    FirstName = m.FullName,
                    Id = m.Id
                }).ToList(),
                Subject = $"Team/Group Updated: {entity.Name}",
                Message = $"The team/group '{entity.Name}' has been updated.",
                Data = new Dictionary<string, string>()
            };
            emailData.Data.Add("UserGroupName", entity.Name ?? "");
            emailData.Data.Add("UserGroupId", entity.Id.ToString());
            _sendEmailAndNotificationService.SendEmail(emailData);

            var notificationData = new NotificationData()
            {
                TenantId = tenantInfo?.Id,
                UserIds = currentMemberIds,
                Type = NotificationType.General,
                Title = $"Team Updated: {entity.Name}",
                Body = $"The team/group '{entity.Name}' has been updated.",
                Data = new Dictionary<string, string>()
            };
            notificationData.Data.Add("UserGroupName", entity.Name ?? "");
            notificationData.Data.Add("UserGroupId", entity.Id.ToString());
            _sendEmailAndNotificationService.SendNotification(notificationData);
        }

        return Result<UpdateUserGroupResponse>.Success(new());
    }
}
