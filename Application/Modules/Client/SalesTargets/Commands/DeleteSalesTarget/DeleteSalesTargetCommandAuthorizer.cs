
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.SalesTargets.Commands.DeleteSalesTarget;

public class DeleteSalesTargetCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteSalesTargetCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;
    
    public DeleteSalesTargetCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteSalesTargetCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Clients.DeleteSalesTarget);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete sales target."));
            return;
        }
        else
        {
            //get sales target by id, if it belongs to the current user then its ok
            var salesTarget = await _context.GetSet<SalesTarget>()
                .FirstOrDefaultAsync(st => st.Id == requirement.Request!.Id, cancellationToken: CancellationToken.None);

            if (salesTarget != null && salesTarget.CreatedBy == _user.Id)
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete sales target."));
            return;
        }
    }
}
