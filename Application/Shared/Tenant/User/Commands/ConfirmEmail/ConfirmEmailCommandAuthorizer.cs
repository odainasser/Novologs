using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;

namespace Novologs.Application.User.Commands.ConfirmEmail;

public class ConfirmEmailCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<ConfirmEmailCommand>>
{
    public ConfirmEmailCommandAuthorizer()
    {
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<ConfirmEmailCommand> requirement
    )
    {
        context.Succeed(requirement);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
