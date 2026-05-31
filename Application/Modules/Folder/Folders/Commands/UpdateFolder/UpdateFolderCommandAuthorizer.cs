using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Folder.Folders.Commands.UpdateFolder;

public class UpdateFolderCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateFolderCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public UpdateFolderCommandAuthorizer(
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
        ZetaAuthorizationRequirement<UpdateFolderCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Folders.UpdateFolder);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update folder."));
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
                .FirstOrDefaultAsync(f => f.Id == requirement.Request!.Id, CancellationToken.None);

            if (folder == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Folder not found."));
                return;
            }

            if (folder.CreatorId == userId)
            {
                context.Succeed(requirement);
                return;
            }
            else
            {
                context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update this folder."));
                return;
            }
        }
    }
}
