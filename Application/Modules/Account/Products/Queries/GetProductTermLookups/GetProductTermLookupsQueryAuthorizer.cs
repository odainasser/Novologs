using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Constants;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Account.Products.Queries.GetProductTermLookups;

public class GetProductTermLookupsQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetProductTermLookupsQuery>>
{
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetProductTermLookupsQueryAuthorizer(UserManager<TenantUser> userManager, ITenantDbContext context)
    {
        _userManager = userManager;
        _context     = context;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetProductTermLookupsQuery> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Permissions.Accounting.ReadProductTerm);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to view product terms."));
            return;
        }

        context.Succeed(requirement);
    }
}
