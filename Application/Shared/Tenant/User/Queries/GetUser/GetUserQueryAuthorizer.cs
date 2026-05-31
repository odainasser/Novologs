using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Application.User.Queries.GetUser;
using Novologs.Domain.Entities;

namespace Novologs.Application.User.Queries.GetUser;

public class GetUserQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetUserQuery>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetUserQueryAuthorizer(
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
        ZetaAuthorizationRequirement<GetUserQuery> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Users.ReadEmployee);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read user."));
            return;
        }
        else
        {
            //manager or (upper employee in hirarchy) can see his own profile and his employees profile
            if (requirement.Request!.Id == _user.IdGuid)
            {
                context.Succeed(requirement);
                return;
            }

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

            var organizationStructure = await _context.GetSet<OrganizationStructure>()
                .Include(d => d.Children)
                .ToListAsync();

            var currentUserNode = organizationStructure
                .FirstOrDefault(d => d.EmployeeId == _user.IdGuid);

            if (currentUserNode != null)
            {
                var allDescendantsIds = HierarchUtil.GetAllDescendantEmployeesIds(currentUserNode);
                if (allDescendantsIds.Contains(requirement.Request.Id))
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read users."));
        }
    }
}
