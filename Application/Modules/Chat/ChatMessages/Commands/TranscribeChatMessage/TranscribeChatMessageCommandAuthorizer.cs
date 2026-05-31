using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;

namespace Novologs.Application.Modules.Chat.ChatMessages.Commands.TranscribeChatMessage;

public class TranscribeChatMessageCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<TranscribeChatMessageCommand>>
{
    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<TranscribeChatMessageCommand> requirement)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            context.Succeed(requirement);
        }
        else
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authenticated."));
        }

        return System.Threading.Tasks.Task.CompletedTask;
    }
}
