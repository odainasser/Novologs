using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.User.Queries.GetUsers;
using Novologs.Domain.Entities;

namespace Novologs.Application.User.Queries.GetUsers;

public class GetUsersQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetUsersQuery>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetUsersQueryAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected async override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetUsersQuery> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Users.ReadEmployee);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read users."));
            return;
        }
        else
        {
            if (await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Users.ReadEmployee))
            {
                context.Succeed(requirement);
                return;
            }

            if (await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.General.ViewAll))
            {
                context.Succeed(requirement);
                return;
            }

            if (await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.General.ViewAll))
            {
                context.Succeed(requirement);
                return;
            }
        }
    }
}
