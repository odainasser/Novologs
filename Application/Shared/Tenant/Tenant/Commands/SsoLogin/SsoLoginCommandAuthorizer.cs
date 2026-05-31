using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;

namespace Novologs.Application.Tenant.Commands.SsoLogin;

public class SsoLoginCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<SsoLoginCommand>>
{
    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<SsoLoginCommand> requirement
    )
    {
        context.Succeed(requirement);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
