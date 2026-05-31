using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Authorization;

namespace Novologs.Application.Roles.Queries.GetUsersWithPermission;

public class GetUsersWithPermissionQueryAuthorizer : Microsoft.AspNetCore.Authorization.AuthorizationHandler<
    ZetaAuthorizationRequirement<GetUsersWithPermissionQuery>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetUsersWithPermissionQueryAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(
        Microsoft.AspNetCore.Authorization.AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetUsersWithPermissionQuery> requirement
    )
    {
        var hasPermission =
            await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Roles.ReadRole);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to get users with permission."));
            return;
        }
        else
        {
            //TODO add permission
            context.Succeed(requirement);
            return;
        }
    }
}
