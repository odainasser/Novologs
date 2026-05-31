
using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.User.Commands.ConfirmEmail;
using Novologs.Application.User.Commands.ConfirmEmailSetPassword;

namespace Novologs.Application.User.Commands.ConfirmEmailSetPassword;

public class ConfirmEmailSetPasswordCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<ConfirmEmailSetPasswordCommand>>
{
    public ConfirmEmailSetPasswordCommandAuthorizer()
    {
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<ConfirmEmailSetPasswordCommand> requirement
    )
    {
        context.Succeed(requirement);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
