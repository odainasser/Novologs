using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Roles.Utility;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Commands.UnassignPermissionToRole;

public class
    UnassignPermissionToRoleCommandAuthorizer : AuthorizationHandler<
    ZetaAuthorizationRequirement<UnassignPermissionToRoleCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public UnassignPermissionToRoleCommandAuthorizer(
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
        ZetaAuthorizationRequirement<UnassignPermissionToRoleCommand> requirement)
    {
        var hasPermission =
            await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Roles.UpdateRole);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this,
                "User is not authorized to unassign permission to role."));
            return;
        }

        await RoleUtility.AuthorizePermissionAssignment(context, this, _user, _userManager, _context,
            requirement.Request!.PermissionIds);

        if (context.HasFailed) return;

        context.Succeed(requirement);
    }
}
