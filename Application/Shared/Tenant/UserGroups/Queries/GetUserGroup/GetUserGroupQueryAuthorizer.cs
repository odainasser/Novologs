using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.UserGroups.Queries.GetUserGroup;
using Novologs.Domain.Entities;

namespace Novologs.Application.UserGroups.Queries.GetUserGroup;

public class GetUserGroupQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetUserGroupQuery>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetUserGroupQueryAuthorizer(
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
        ZetaAuthorizationRequirement<GetUserGroupQuery> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Domain.Constants.Permissions.UserSalesGroup.ReadUserGroup);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read user group."));
            return;
        }
        else
        {
            context.Succeed(requirement);
            return;
        }
    }
}
