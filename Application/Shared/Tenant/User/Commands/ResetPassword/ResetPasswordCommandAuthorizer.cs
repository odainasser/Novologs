using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.User.Commands.ResetPassword;

namespace Novologs.Application.User.Commands.ResetPassword;

public class ResetPasswordCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<ResetPasswordCommand>>
{
    public ResetPasswordCommandAuthorizer()
    {
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<ResetPasswordCommand> requirement
    )
    {
        context.Succeed(requirement);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}