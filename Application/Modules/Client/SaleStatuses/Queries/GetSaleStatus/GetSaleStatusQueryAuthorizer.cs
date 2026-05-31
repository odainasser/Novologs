using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.SaleStatuses.Queries.GetSaleStatus;

public class GetSaleStatusQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetSaleStatusQuery>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetSaleStatusQueryAuthorizer(
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
        ZetaAuthorizationRequirement<GetSaleStatusQuery> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Clients.ReadLeadSaleStatus);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read sale status."));
            return;
        }
        else
        {
            context.Succeed(requirement);
            return;
        }
    }
}
