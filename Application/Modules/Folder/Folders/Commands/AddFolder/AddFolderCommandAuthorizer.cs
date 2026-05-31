using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Folder.Folders.Commands.AddFolder;

public class AddFolderCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<AddFolderCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IFolderPolicyService _folderPolicyService;

    public AddFolderCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager,
        IFolderPolicyService folderPolicyService)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
        _folderPolicyService = folderPolicyService;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<AddFolderCommand> requirement)
    {
        if (requirement.Request?.File != null)
        {
            var policyResult = await _folderPolicyService.ValidateStoragePolicy(requirement.Request.File.Length);
            if (!policyResult.Succeeded)
            {
                foreach (var error in policyResult.Errors)
                {
                    context.Fail(new AuthorizationFailureReason(this, $"{error.Code}: {error.Description}"));
                }

                return;
            }
        }

        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Folders.CreateFolder);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to add folder."));
            return;
        }
        else
        {
            context.Succeed(requirement);
            return;
        }
    }
}
