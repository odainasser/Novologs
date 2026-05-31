using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;

namespace Novologs.Application.Tenant.Commands.InitiateSsoLink;

public class InitiateSsoLinkCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<InitiateSsoLinkCommand>>
{
    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<InitiateSsoLinkCommand> requirement
    )
    {
        context.Succeed(requirement);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
