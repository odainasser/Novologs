using Novologs.Application.Common.Authorization;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;

namespace Novologs.Application.Roles.Commands.AddDescriptionToPermission;


public class AddDescriptionToPermissionCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<AddDescriptionToPermissionCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public AddDescriptionToPermissionCommandAuthorizer(
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
        ZetaAuthorizationRequirement<AddDescriptionToPermissionCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Roles.AddDescriptionToPermission);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to add description to permission."));
            return;
        }
        else
        {
            context.Succeed(requirement);
        }
    }
}
