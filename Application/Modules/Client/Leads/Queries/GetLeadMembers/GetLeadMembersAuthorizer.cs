using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.Leads.Queries.GetLeadMembers;

public class GetLeadMembersAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetLeadMembersQuery>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetLeadMembersAuthorizer(
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
        ZetaAuthorizationRequirement<GetLeadMembersQuery> requirement)
    {
        // User must be either the creator or a member of the lead
        var lead = await _context.GetSet<ClientLead>()
            .Include(l => l.LeadMembers)
            .FirstOrDefaultAsync(l => l.Id == requirement.Request!.LeadId);

        if (lead == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Lead not found."));
            return;
        }

        var isCreator = lead.CreatorId == _user.IdGuid;
        var isMember = lead.LeadMembers.Any(lm => lm.MemberId == _user.IdGuid && !lm.IsDeleted);

        if (isCreator || isMember)
        {
            context.Succeed(requirement);
            return;
        }

        context.Fail(new AuthorizationFailureReason(this, "User is not authorized to view lead members."));
    }
}
