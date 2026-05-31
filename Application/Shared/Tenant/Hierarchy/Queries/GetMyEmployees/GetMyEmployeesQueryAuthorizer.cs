using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Hierarchy.Queries.GetMyEmployees;

public class GetMyEmployeesQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetMyEmployeesQuery>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;
    public GetMyEmployeesQueryAuthorizer(
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
        ZetaAuthorizationRequirement<GetMyEmployeesQuery> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Users.ReadEmployee);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to get my employees."));
            return;
        }
        else
        {
            context.Succeed(requirement);
        }
    }

}
