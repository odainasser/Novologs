using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Commands.BackfillInternalDashboardPermission;

public class BackfillInternalDashboardPermissionCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<BackfillInternalDashboardPermissionCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public BackfillInternalDashboardPermissionCommandAuthorizer(
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
        ZetaAuthorizationRequirement<BackfillInternalDashboardPermissionCommand> requirement)
    {
        // Only SuperAdmin or users with role update permission can execute this command
        var hasPermission = await context.User.HasPermission(
            _userManager, 
            _context, 
            Domain.Constants.Permissions.Roles.UpdateRole);

        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(
                this, 
                "User is not authorized to backfill dashboard permissions. This operation requires role update permissions."));
            return;
        }

        context.Succeed(requirement);
    }
}
