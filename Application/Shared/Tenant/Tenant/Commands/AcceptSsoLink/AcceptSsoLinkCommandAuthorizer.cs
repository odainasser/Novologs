using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;

namespace Novologs.Application.Tenant.Commands.AcceptSsoLink;

public class AcceptSsoLinkCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<AcceptSsoLinkCommand>>
{
    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<AcceptSsoLinkCommand> requirement
    )
    {
        context.Succeed(requirement);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
