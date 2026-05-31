
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Currencys.Commands.DeleteCurrency;

public class DeleteCurrencyCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteCurrencyCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;
    public DeleteCurrencyCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteCurrencyCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.General.Currency);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete currency."));
            return;
        }
        else
        {
            context.Succeed(requirement);
        }
    }
}
