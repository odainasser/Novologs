
using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.User.Commands.Login;

namespace Novologs.Application.User.Commands.Login;

public class LoginCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<LoginCommand>>
{
    public LoginCommandAuthorizer()
    {
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<LoginCommand> requirement
    )
    {
        context.Succeed(requirement);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
