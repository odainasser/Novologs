
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Folder.Folders.Commands.ShareFolder;

public class ShareFolderCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<ShareFolderCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    public ShareFolderCommandAuthorizer(
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
        ZetaAuthorizationRequirement<ShareFolderCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Folders.ShareFolder);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to share folder."));
            return;
        }
        else
        {
            if (_user.Id == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "User not authenticated."));
                return;
            }

            if (!Guid.TryParse(_user.Id, out var userId))
            {
                context.Fail(new AuthorizationFailureReason(this, "Invalid user ID format."));
                return;
            }

            var folder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                .Include(f => f.Shares)
                .FirstOrDefaultAsync(x => x.Id == requirement.Request!.Id, CancellationToken.None);

            if (folder == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Folder not found."));
                return;
            }

            // Check if the current user is the creator of the folder
            if (folder.CreatorId == userId)
            {
                context.Succeed(requirement);
                return;
            }

            // Check if the user has 'CanReshare' permission on this specific folder
            var userShare = folder.Shares.FirstOrDefault(s => s.SharedWithUserId == userId);
            if (userShare != null && userShare.PermissionLevel == Novologs.Domain.Enums.FolderSharePermissionLevel.CanReshare)
            {
                context.Succeed(requirement);
                return;
            }
            else
            {
                context.Fail(new AuthorizationFailureReason(this, "User is not authorized to share this folder."));
                return;
            }
        }
    }
}
