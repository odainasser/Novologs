using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.WorkStatuss.Commands.ChangMyWorkStatus;
using Novologs.Domain.Entities;

namespace Novologs.Application.WorkStatuss.Commands.ChangMyWorkStatus;

public class
    ChangMyWorkStatusCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<ChangMyWorkStatusCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public ChangMyWorkStatusCommandAuthorizer(
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
        ZetaAuthorizationRequirement<ChangMyWorkStatusCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Users.UpdateOwnEmployeeStatus);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to change my work status."));
            return;
        }
        else{
            context.Succeed(requirement);
            return;
        }
    }
}
