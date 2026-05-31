using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Roles.Utility;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Commands.AssignPermissionToRole;

public class
    AssignPermissionToRoleCommandAuthorizer : AuthorizationHandler<
    ZetaAuthorizationRequirement<AssignPermissionToRoleCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public AssignPermissionToRoleCommandAuthorizer(
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
        ZetaAuthorizationRequirement<AssignPermissionToRoleCommand> requirement)
    {
        var hasPermission =
            await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Roles.UpdateRole);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to assign permission to role."));
            return;
        }

        await RoleUtility.AuthorizePermissionAssignment(context, this, _user, _userManager, _context,
            requirement.Request!.PermissionIds);

        if (context.HasFailed) return;

        context.Succeed(requirement);
    }
}
