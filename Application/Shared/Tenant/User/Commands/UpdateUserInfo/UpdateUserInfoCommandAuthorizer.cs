
using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.User.Commands.UpdateUserInfo;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Common.Interfaces; 
using Novologs.Domain.Entities;
using Novologs.Infrastructure.Services;

namespace Novologs.Application.User.Commands.UpdateUserInfo;

public class UpdateUserInfoCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateUserInfoCommand>>
{
    private readonly UserManager<TenantUser> _userManager; 
    private readonly ITenantDbContext _context;
    private readonly ITenantPolicyService _tenantPolicyService;

    public UpdateUserInfoCommandAuthorizer(UserManager<TenantUser> userManager, ITenantDbContext context, ITenantPolicyService tenantPolicyService)
    {
        _userManager = userManager;
        _context = context;
        _tenantPolicyService = tenantPolicyService;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<UpdateUserInfoCommand> requirement
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
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update user info."));
            return;
        }
        else{
            context.Succeed(requirement);
            return ;
        }
    }
}
