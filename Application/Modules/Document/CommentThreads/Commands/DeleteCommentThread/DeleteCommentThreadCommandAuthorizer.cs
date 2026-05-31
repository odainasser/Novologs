
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Document.CommentThreads.Commands.DeleteCommentThread;

public class DeleteCommentThreadCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteCommentThreadCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;
    
    public DeleteCommentThreadCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteCommentThreadCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Comments.Delete);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete comment thread."));
            return;
        }
        else
        {
            // Check if the user is the creator of the comment thread
            var commentThread = await _context.GetSet<CommentThread>()
                .Include(ct => ct.Items)
                .ThenInclude(ci => ci.Sender)
                .FirstOrDefaultAsync(ct => ct.Id == requirement.Request!.Id);

            if (commentThread != null && commentThread.Items.Any() && commentThread.Items.First().SenderId == Guid.Parse(_user.Id!))
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete this comment thread."));
            return;
        }
    }

}
