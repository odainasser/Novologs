using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Tenant.Commands.InitTenant;
using Novologs.Domain.Entities;

namespace Novologs.Application.Tenant.Commands.InitTenant;

public class InitTenantCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<InitTenantCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public InitTenantCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }


    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<InitTenantCommand> requirement
    )
    {
        context.Succeed(requirement);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
