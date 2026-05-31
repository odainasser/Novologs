using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Infrastructure.Services;

namespace Novologs.Application.User.Commands.ResendActivationEmail;

public class ResendActivationEmailCommandAuthorizer
    : AuthorizationHandler<ZetaAuthorizationRequirement<ResendActivationEmailCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantPolicyService _tenantPolicyService;

    public ResendActivationEmailCommandAuthorizer(
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
        ZetaAuthorizationRequirement<ResendActivationEmailCommand> requirement)
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

        var hasPermission = await context.User.HasPermission(
            _userManager,
            _context,
            Domain.Constants.Permissions.Users.ResendActivationEmail);

        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to resend activation email."));
            return;
        }

        context.Succeed(requirement);
    }
}
