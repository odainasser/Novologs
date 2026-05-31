using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.WorkStatuss.Commands.DeleteWorkStatus;
using Novologs.Domain.Entities;

namespace Novologs.Application.WorkStatuss.Commands.DeleteWorkStatus;

public class DeleteWorkStatusCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteWorkStatusCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public DeleteWorkStatusCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteWorkStatusCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Users.DeleteEmployeeStatus);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete work status."));
            return;
        }
        else
        {
            context.Succeed(requirement);
        }
    }
}
