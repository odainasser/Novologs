using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.User.Commands.UpdateUser;
using Novologs.Domain.Entities;
using Novologs.Infrastructure.Services;

namespace Novologs.Application.User.Commands.UpdateUser;

public class UpdateUserCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateUserCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantPolicyService _tenantPolicyService;
    private readonly ITenantDbContext _context;

    public UpdateUserCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager,
        ITenantPolicyService tenantPolicyService)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
        _tenantPolicyService = tenantPolicyService;
    }

    protected async override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<UpdateUserCommand> requirement
    )
    {
        var policyResult = await _tenantPolicyService.ValidatePolicies();
        if (!policyResult.Succeeded)
        {
            foreach (var error in policyResult.Errors)
            {
                context.Fail(new AuthorizationFailureReason(this, $"{error.Code}: {error.Description}"));
            }
            return;
        }
        
        var hasUserSettingsPermission = await context.User.HasPermission(_userManager, _context,
            Domain.Constants.Permissions.General.UserSettings);
        if (hasUserSettingsPermission)
        {
            context.Succeed(requirement);
            return;
        }

        var hasPermission =
            await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Users.UpdateEmployee);
        if (hasPermission)
        {
            context.Succeed(requirement);
            return;
        }

        context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update this user."));
        return;
    }
}
