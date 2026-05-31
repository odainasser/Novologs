using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Document.CommentItems.Commands.UpdateCommentItem;

public class
    UpdateCommentItemCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateCommentItemCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public UpdateCommentItemCommandAuthorizer(
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
        ZetaAuthorizationRequirement<UpdateCommentItemCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Comments.Update);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update comment item."));
            return;
        }
        else
        {
            var commentItem = await _context.GetSet<CommentItem>()
                .FirstOrDefaultAsync(ci => ci.Id == requirement.Request!.Id, cancellationToken: CancellationToken.None);

            if (commentItem != null && commentItem.SenderId == Guid.Parse(_user.Id!))
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update comment items."));
            return;
        }
    }
}
