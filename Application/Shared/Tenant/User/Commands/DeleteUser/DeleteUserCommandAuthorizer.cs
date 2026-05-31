using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.User.Commands.DeleteUser;
using Novologs.Domain.Entities;
using Novologs.Infrastructure.Services;

namespace Novologs.Application.User.Commands.DeleteUser;

public class DeleteUserCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteUserCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantPolicyService _tenantPolicyService;

    public DeleteUserCommandAuthorizer(
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

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<DeleteUserCommand> requirement
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
        
        var hasPermission = await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Users.DeleteEmployee);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete user."));
            return;
        }
        else
        {
            context.Succeed(requirement);
        }

        return;
    }
}
