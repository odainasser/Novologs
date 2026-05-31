using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Application.User.Dto;
using Novologs.Application.UserStatistics.Dto;
using Novologs.Application.UserStatistics.Queries.GetUserStatistic;
using Novologs.Domain.Entities;

namespace Novologs.Application.UserStatistics.Queries.GetUserStatistic;

public class GetUserStatisticQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetUserStatisticQuery>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetUserStatisticQueryAuthorizer(
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
        ZetaAuthorizationRequirement<GetUserStatisticQuery> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Domain.Constants.Permissions.Users.ReadUserStatistic);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read user statistic."));
            return;
        }
        else
        {
            if (requirement.Request!.UserId == null || requirement.Request.UserId == _user.IdGuid)
            {
                context.Succeed(requirement);
                return;
            }
            else if (await context.User.HasPermission(_userManager, _context,
                         Domain.Constants.Permissions.Users.ReadUserStatistic))
            {
                context.Succeed(requirement);
                return;
            }
            //or is my employee (under me in the hierarch)
            else
            {
                var organizationStructure = await _context.GetSet<OrganizationStructure>()
                    .Include(d => d.Children)
                    .ToListAsync();
                var currentUserNode = organizationStructure
                    .FirstOrDefault(d => d.EmployeeId == _user.IdGuid);

                if (currentUserNode != null)
                {
                    var allDescendantEmployeesIds = HierarchUtil.GetAllDescendantEmployeesIds(currentUserNode);
                    if (allDescendantEmployeesIds.Contains(requirement.Request.UserId.Value))
                    {
                        context.Succeed(requirement);
                        return;
                    }
                }
            }

            context.Fail(
                new AuthorizationFailureReason(this, "User is not authorized to view other user's statistics."));
        }
    }
}
