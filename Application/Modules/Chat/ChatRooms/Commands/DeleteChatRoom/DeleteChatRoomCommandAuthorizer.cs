using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Chat.ChatRooms.Commands.DeleteChatRoom;

public class DeleteChatRoomCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteChatRoomCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public DeleteChatRoomCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteChatRoomCommand> requirement)
    {
        var hasPermission =
            await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Chats.Delete);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete chat room."));
            return;
        }
        else
        {
            // Allow if the user is the creator of the chat room
            var isCreator = await _context.GetSet<Novologs.Domain.Entities.ChatRoom>()
                .AnyAsync(cr => cr.Id == requirement.Request!.Id && cr.CreatorId == _user.IdGuid);

            if (isCreator)
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete this chat room."));
            return;
        }
    }
}
