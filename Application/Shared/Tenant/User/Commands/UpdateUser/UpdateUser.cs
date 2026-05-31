using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Identity;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.User.Commands.UpdateUser;

public record UpdateUserCommand : IRequest<Result<UpdateUserResponse>>
{
    public Guid UserId { get; set; } 
    public string? Code { get; set; } = null!;
    public string? FullName { get; set; } = null!;
    public string? UserName { get; set; } = null;
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; } = null!;
    public string? Country { get; set; } = "UAE";
    public string? Language { get; set; } = "EN";
    public decimal? HourlyRate { get; set; } = 0;
    
    public UserType? UserType { get; set; }
    public Guid? HierarchyParentId { get; set; } = null;
    public Guid? DesignationId { get; set; } = null;
    public Guid? DepartmentId { get; set; } = null;
    
    public Guid? ProfileImageFileId { get; set; } 
    public Guid? CompanyBranchId { get; set; }
    public int? TaskLevelElveator { get; set; } = 0;
    public List<string>? Roles { get; set; } = new List<string>();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateUserCommand, TenantUser>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null))
                ;
            ;
        }
    }
}

public class UpdateUserResponse
{
}

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, Result<UpdateUserResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly UserManager<TenantUser> _userManager;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public UpdateUserCommandHandler(
        ITenantDbContext context,
        UserManager<TenantUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        IMapper mapper,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor
    )
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _mapper = mapper;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<UpdateUserResponse>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = _userManager.Users.FirstOrDefault(u => u.Id == request.UserId);
        if (user == null)
        {
            return Result<UpdateUserResponse>.Failure(new[] { new ErrorItem("User_001", "User not found") });
        }

        _mapper.Map(request, user);
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return Result<UpdateUserResponse>.Failure(result.Errors.Select(e => new ErrorItem(e.Code, e.Description)));
        }

        var userRoles = await _userManager.GetRolesAsync(user);
        var rolesToRemove = userRoles.Except(request.Roles ?? new());
        var rolesToAdd = request.Roles?.Except(userRoles) ?? new List<string>();
        if (rolesToRemove.Any())
        {
            await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
        }

        if (rolesToAdd.Any())
        {
            await _userManager.AddToRolesAsync(user, rolesToAdd);
        }

        // Send email and notification to the user about the update
        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        var emailData = new EmailData()
        {
            TenantId = tenantInfo?.Id,
            EmailTemplate = EmailTemplate.NotificationEmail,
            UserInfo = new List<EmailUserInfo>
            {
                new EmailUserInfo { Email = user.Email!, FirstName = user.FullName, Id = user.Id }
            },
            Subject = "Your User Profile Has Been Updated",
            Message = $"Your user profile has been updated by an administrator.",
            Data = new Dictionary<string, string>()
        };
        emailData.Data.Add("UserName", user.FullName ?? user.UserName ?? "");
        emailData.Data.Add("UserId", user.Id.ToString());
        _sendEmailAndNotificationService.SendEmail(emailData);

        var notificationData = new NotificationData()
        {
            TenantId = tenantInfo?.Id,
            UserIds = new List<Guid> { user.Id },
            Type = NotificationType.General,
            Title = "User Profile Updated",
            Body = "Your user profile has been updated by an administrator.",
            Data = new Dictionary<string, string>()
        };
        notificationData.Data.Add("UserName", user.FullName ?? user.UserName ?? "");
        notificationData.Data.Add("UserId", user.Id.ToString());
        _sendEmailAndNotificationService.SendNotification(notificationData);

        return Result<UpdateUserResponse>.Success(new UpdateUserResponse());
    }
}
