using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Authorization;

namespace Novologs.Application.Roles.Queries.GetUsersInRole;

public class GetUsersInRoleQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetUsersInRoleQuery>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetUsersInRoleQueryAuthorizer(
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
        ZetaAuthorizationRequirement<GetUsersInRoleQuery> requirement
    )
    {
        var hasPermission =
            await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Roles.ReadRole);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to get users in role."));
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
