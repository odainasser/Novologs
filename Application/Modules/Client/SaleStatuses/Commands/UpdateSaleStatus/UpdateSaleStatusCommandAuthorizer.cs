
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.SaleStatuses.Commands.UpdateSaleStatus;

public class UpdateSaleStatusCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateSaleStatusCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    
    public UpdateSaleStatusCommandAuthorizer(
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
        ZetaAuthorizationRequirement<UpdateSaleStatusCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Clients.UpdateLeadSaleStatus);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update sale status."));
            return;
        }
        else
        {
            //get sales target by id, if it belongs to the current user then its ok
            var salesTarget = await _context.GetSet<LeadSaleStatus>()
                .FirstOrDefaultAsync(st => st.Id == requirement.Request!.Id, cancellationToken: CancellationToken.None);

            if (salesTarget != null && salesTarget.CreatedBy == _user.Id)
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update sales status."));
            return;
        }
    }
}
