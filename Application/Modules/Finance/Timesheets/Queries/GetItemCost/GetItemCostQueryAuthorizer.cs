using Novologs.Application.Modules.Finance.ItemCosts.Queries.GetItemCost;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Finance.Timesheets.Queries.GetItemCost;

public class GetItemCostQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetItemCostQuery>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetItemCostQueryAuthorizer(
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
        ZetaAuthorizationRequirement<GetItemCostQuery> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Finance.ReadTimesheet);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read item cost."));
            return;
        }
        else
        {
            if (await context.User.HasPermission(_userManager, _context,
                    Novologs.Domain.Constants.Permissions.Finance.ViewAllTimesheets))
            {
                context.Succeed(requirement);
                return;
            }

            if (await context.User.HasPermission(_userManager, _context,
                    Novologs.Domain.Constants.Permissions.General.ViewAll))
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to view item costs."));
            return;
        }
    }
}
