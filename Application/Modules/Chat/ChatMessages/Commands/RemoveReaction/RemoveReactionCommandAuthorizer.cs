using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Chat.ChatMessages.Commands.RemoveReaction;

public class RemoveReactionCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<RemoveReactionCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public RemoveReactionCommandAuthorizer(
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
        ZetaAuthorizationRequirement<RemoveReactionCommand> requirement)
    {
        if (requirement.Request == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Invalid request."));
            return;
        }

        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Chats.RemoveReaction);

        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to remove reactions."));
            return;
        }

        // Check if user owns the reaction
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            context.Fail(new AuthorizationFailureReason(this, "User not found."));
            return;
        }

        var reaction = await _context.GetSet<Novologs.Domain.Entities.ChatMessageReaction>()
            .FirstOrDefaultAsync(r => r.ChatMessageId == requirement.Request.MessageId && r.UserId == userId && r.Emoji == requirement.Request.Emoji && r.IsDeleted == false);

        if (reaction == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Reaction not found or user does not own this reaction."));
            return;
        }

        context.Succeed(requirement);
    }
}
