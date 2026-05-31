using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Hierarchy.Commands.SwapUserInHierarchy;

public class
    SwapUserInHierarchyCommandAuthorizer : AuthorizationHandler<
    ZetaAuthorizationRequirement<SwapUserInHierarchyCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public SwapUserInHierarchyCommandAuthorizer(
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
        ZetaAuthorizationRequirement<SwapUserInHierarchyCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Users.UpdateEmployee);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to swap user in hierarchy."));
            return;
        }
        else
        {
            context.Succeed(requirement);
        }
    }
}
