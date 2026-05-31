using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.User.Commands.GetRolesUser;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Common.Interfaces; 
using Novologs.Domain.Entities;
using Novologs.Infrastructure.Services;

namespace Novologs.Application.User.Commands.GetAllRolesUser;

public class GetRolesUserCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetRolesUserCommand>>
{
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;
    private readonly ITenantPolicyService _tenantPolicyService;

    public GetRolesUserCommandAuthorizer(UserManager<TenantUser> userManager, ITenantDbContext context, ITenantPolicyService tenantPolicyService)
    {
        _userManager = userManager;
        _context = context;
        _tenantPolicyService = tenantPolicyService;
    }


    protected override async System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetRolesUserCommand> requirement
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
        
        var hasPermission =
            await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Roles.ReadRole);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to get roles user."));
            return;
        }
        else
        {
            context.Succeed(requirement);
            return;
        }
    }
}
