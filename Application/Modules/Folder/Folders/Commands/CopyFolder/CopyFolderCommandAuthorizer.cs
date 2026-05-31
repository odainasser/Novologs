using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Folder.Folders.Commands.CopyFolder;

public class CopyFolderCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<CopyFolderCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public CopyFolderCommandAuthorizer(
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
        ZetaAuthorizationRequirement<CopyFolderCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Folders.CopyFolder);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to copy folder."));
            return;
        }
        else
        {
            //user should have access to source and destination files and folders
            var sourceFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                .FirstOrDefaultAsync(f => f.Id == requirement.Request!.Source, CancellationToken.None);

            var destinationFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                .FirstOrDefaultAsync(f => f.Id == requirement.Request!.Destination, CancellationToken.None);

            if (sourceFolder == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Source folder not found."));
                return;
            }

            if (destinationFolder == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Destination folder not found."));
                return;
            }

            // Check if the user has read permission on the source folder
            if (sourceFolder.CreatorId != Guid.Parse(_user.Id!) &&
                !await _userManager.HasPermissionAsync(_context, Guid.Parse(_user.Id!),
                    Novologs.Domain.Constants.Permissions.Folders.ReadFolder))
            {
                context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read the source folder."));
                return;
            }

            //TODO tobe discussed later

            // Check if the user has write permission on the destination folder (or create permission if it's a new file)
            if (destinationFolder.CreatorId != Guid.Parse(_user.Id!) &&
                !await _userManager.HasPermissionAsync(_context, Guid.Parse(_user.Id!),
                    Novologs.Domain.Constants.Permissions.Folders.UpdateFolder) &&
                !await _userManager.HasPermissionAsync(_context, Guid.Parse(_user.Id!),
                    Novologs.Domain.Constants.Permissions.Folders.CreateFolder))
            {
                context.Fail(new AuthorizationFailureReason(this,
                    "User is not authorized to write to the destination folder."));
                return;
            }

            context.Succeed(requirement);
            return;
        }
    }
}
