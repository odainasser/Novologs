using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Chat.ChatMessages.Commands.ToggleReaction;

public class ToggleReactionCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<ToggleReactionCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public ToggleReactionCommandAuthorizer(
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
        ZetaAuthorizationRequirement<ToggleReactionCommand> requirement)
    {
        if (requirement.Request == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Invalid request."));
            return;
        }

        // User must be a member or recipient of the message
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            context.Fail(new AuthorizationFailureReason(this, "User not found."));
            return;
        }

        var message = await _context.GetSet<Novologs.Domain.Entities.ChatMessage>()
            .Include(m => m.Recievers)
            .Include(m => m.ChatRoom)
                .ThenInclude(r => r!.Members)
            .FirstOrDefaultAsync(m => m.Id == requirement.Request.MessageId);

        if (message == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Message not found."));
            return;
        }

        // Check if user is sender, receiver, or room member
        bool isAuthorized = message.SenderId == userId ||
                           message.Recievers.Any(r => r.RecieverId == userId) ||
                           (message.ChatRoom != null &&
                            message.ChatRoom.Members.Any(m => m.MemberId == userId));

        if (!isAuthorized)
        {
            context.Fail(new AuthorizationFailureReason(this,
                "User is not authorized to react to this message."));
            return;
        }

        context.Succeed(requirement);
    }
}
