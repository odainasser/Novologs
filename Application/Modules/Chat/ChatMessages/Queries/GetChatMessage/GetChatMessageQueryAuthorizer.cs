using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Chat.ChatMessages.Queries.GetChatMessage;

public class GetChatMessageQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetChatMessageQuery>>
{
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetChatMessageQueryAuthorizer(
        UserManager<TenantUser> userManager,
        ITenantDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }


    protected override async System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetChatMessageQuery> requirement
    )
    {
        var hasPermission =
            await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Chats.Read);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read chat message."));
            return;
        }
        else
        {
            context.Succeed(requirement);
            return;
        }
    }
}
