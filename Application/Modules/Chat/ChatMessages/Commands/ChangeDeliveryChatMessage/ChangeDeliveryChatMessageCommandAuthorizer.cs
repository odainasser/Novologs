
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Chat.ChatMessages.Commands.ChangeDeliveryChatMessage;

public class ChangeDeliveryChatMessageCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<ChangeDeliveryChatMessageCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;
    
    public ChangeDeliveryChatMessageCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<ChangeDeliveryChatMessageCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Chats.Update);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to change delivery chat message."));
            return;
        }
        else
        {
            // Allow if the user is the receiver of the message
            var isReceiver = await _context.GetSet<Novologs.Domain.Entities.ChatMessageReciever>()
                .AnyAsync(r => r.ChatMessageId == requirement.Request!.MessageId && r.RecieverId == _user.IdGuid);

            if (isReceiver)
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to change delivery status for this message."));
            return;
        }
    }
}
