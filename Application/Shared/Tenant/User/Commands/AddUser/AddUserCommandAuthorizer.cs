using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.User.Commands.AddUser;
using Novologs.Domain.Entities;
using Novologs.Infrastructure.Services;

namespace Novologs.Application.User.Commands.AddUser;

public class AddUserCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<AddUserCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantPolicyService _tenantPolicyService;
    private readonly ITenantDbContext _context;

    public AddUserCommandAuthorizer(
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
        ZetaAuthorizationRequirement<AddUserCommand> requirement
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
        
        var hasPermission = await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Users.AddEmployee);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to add user."));
            return;
        }
        else
        {
            context.Succeed(requirement);
        }
    }
}
