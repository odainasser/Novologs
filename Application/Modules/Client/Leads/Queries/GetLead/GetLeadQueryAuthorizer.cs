using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Common.Interfaces; 
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.Leads.Queries.GetLead;

public class GetLeadQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetLeadQuery>>
{
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetLeadQueryAuthorizer(UserManager<TenantUser> userManager, ITenantDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }


    protected override async System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetLeadQuery> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Clients.ReadLead);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read lead."));
            return;
        }
        else
        {
            context.Succeed(requirement);
            return;
        }
    }
}
