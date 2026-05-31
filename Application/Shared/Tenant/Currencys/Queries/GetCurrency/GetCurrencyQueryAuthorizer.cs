using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Currencys.Queries.GetCurrency;

public class GetCurrencyQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetCurrencyQuery>>
{
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetCurrencyQueryAuthorizer(UserManager<TenantUser> userManager, ITenantDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetCurrencyQuery> requirement)
    {
        var hasPermission =
            await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.General.ReadCurrency)
            || await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.General.Currency)
            || await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.General.ViewAll);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to get currency."));
            return;
        }
        else
        {
            context.Succeed(requirement);
            return;
        }
    }
}
