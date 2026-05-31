using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Leads.LeadUpdates.Queries.GetLeadUpdate;

public class GetLeadUpdateAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetLeadUpdateQuery>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetLeadUpdateAuthorizer(
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
        ZetaAuthorizationRequirement<GetLeadUpdateQuery> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Clients.ReadLeadUpdate);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read lead updates."));
            return;
        }

        // If a specific LeadId is provided, verify access to that lead
        if (requirement.Request!.LeadId.HasValue)
        {
            var lead = await _context.GetSet<ClientLead>()
                .Include(l => l.LeadMembers)
                .FirstOrDefaultAsync(l => l.Id == requirement.Request.LeadId.Value, cancellationToken: CancellationToken.None);

            if (lead == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Lead not found."));
                return;
            }

            var isCreator = lead.CreatedBy == _user.Id;
            var hasMemberViewPermission = lead.LeadMembers
                .Any(lm => lm.MemberId == _user.IdGuid
                           && !lm.IsDeleted
                           && lm.PermissionLevel.HasFlag(LeadMemberPermission.View));

            if (isCreator || hasMemberViewPermission)
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to view updates for this lead."));
            return;
        }

        // If no specific LeadId, allow query (will be filtered in handler)
        context.Succeed(requirement);
    }
}
