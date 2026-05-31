
using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Common.Interfaces; 
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.RejectionReasons.Queries.GetRejectionReason;

public class GetRejectionReasonQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetRejectionReasonQuery>>
{
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetRejectionReasonQueryAuthorizer(UserManager<TenantUser> userManager, ITenantDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }


    protected override async System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetRejectionReasonQuery> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Clients.ReadLeadRejectionReason);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read rejection reason."));
            return;
        }
        else{
            context.Succeed(requirement);
            return;
        }
    }
}
