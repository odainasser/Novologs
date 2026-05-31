using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.User.Commands.ChangePassword;
using Novologs.Domain.Entities;
using Novologs.Infrastructure.Services;

namespace Novologs.Application.User.Commands.ChangePassword;

public class ChangePasswordCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<ChangePasswordCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantPolicyService _tenantPolicyService;

    public ChangePasswordCommandAuthorizer(
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
        ZetaAuthorizationRequirement<ChangePasswordCommand> requirement
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
        
        var hasPermission = await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Users.UpdateEmployee);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to change password."));
            return;
        }
        else
        {
            var email = requirement.Request?.Email;
            if (string.IsNullOrEmpty(email))
            {
                context.Fail(new AuthorizationFailureReason(this, "Email is required.")); 
                return;
            }
            var user =await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "User not found."));
                return;
            } 
            
            if (_user.IdGuid == user.Id)
            {
                context.Succeed(requirement);
                return;
            }
            else
            {
                context.Fail(new AuthorizationFailureReason(this, "User is not authorized to change this password."));
                return;
            } 
        }
    }
}
