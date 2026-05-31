using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Chat.ChatMessages.Commands.DeleteChatMessage;

public class
    DeleteChatMessageCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteChatMessageCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public DeleteChatMessageCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteChatMessageCommand> requirement)
    {
        // DeletedForMe (1) - any user can hide a message for themselves, no special permission needed
        if (requirement.Request!.DeletedStatus == Novologs.Domain.Enums.ChatMessageDeleteStatus.DeletedForMe)
        {
            context.Succeed(requirement);
            return;
        }

        // DeletedForAll (2) - requires delete permission and must be the sender
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Chats.Delete);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete chat message."));
            return;
        }

        // Verify the user is the sender of the message
        var isSender = await _context.GetSet<Novologs.Domain.Entities.ChatMessage>()
            .AnyAsync(m => m.Id == requirement.Request!.Id && m.SenderId == _user.IdGuid);

        if (isSender)
        {
            context.Succeed(requirement);
            return;
        }

        context.Fail(new AuthorizationFailureReason(this, "Only the sender can delete a message for all users."));
        return;
    }
}
