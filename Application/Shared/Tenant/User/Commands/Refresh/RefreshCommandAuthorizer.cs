
using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.User.Commands.Refresh;

namespace Novologs.Application.User.Commands.Refresh;

public class RefreshCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<RefreshCommand>>
{
    public RefreshCommandAuthorizer()
    {
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<RefreshCommand> requirement
    )
    {
        context.Succeed(requirement);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
