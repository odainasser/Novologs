
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.RejectionReasons.Commands.UpdateRejectionReason;

public class UpdateRejectionReasonCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateRejectionReasonCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    
    public UpdateRejectionReasonCommandAuthorizer(
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
        ZetaAuthorizationRequirement<UpdateRejectionReasonCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Clients.UpdateLeadRejectionReason);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update rejection reason."));
            return;
        }
        else
        {
            //get rejection reason by id, if it belongs to the current user then its ok
            var rejectionReason = await _context.GetSet<Novologs.Domain.Entities.LeadRejectionReason>()
                .FirstOrDefaultAsync(r => r.Id == requirement.Request!.Id, cancellationToken: CancellationToken.None);

            if (rejectionReason != null && rejectionReason.CreatedBy == _user.Id)
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update rejection reason."));
            return;
        }
    }
}
