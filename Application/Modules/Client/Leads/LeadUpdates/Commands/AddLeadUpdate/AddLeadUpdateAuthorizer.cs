using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Leads.LeadUpdates.Commands.AddLeadUpdate;

public class AddLeadUpdateAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<AddLeadUpdateCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public AddLeadUpdateAuthorizer(
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
        ZetaAuthorizationRequirement<AddLeadUpdateCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Clients.AddLeadUpdate);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to add lead updates."));
            return;
        }

        var lead = await _context.GetSet<ClientLead>()
            .Include(l => l.LeadMembers)
            .FirstOrDefaultAsync(l => l.Id == requirement.Request!.LeadId, cancellationToken: CancellationToken.None);

        if (lead == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Lead not found."));
            return;
        }

        var isCreator = lead.CreatedBy == _user.Id;
        var hasMemberUpdatePermission = lead.LeadMembers
            .Any(lm => lm.MemberId == _user.IdGuid
                       && !lm.IsDeleted
                       && lm.PermissionLevel.HasFlag(LeadMemberPermission.Update));

        if (isCreator || hasMemberUpdatePermission)
        {
            context.Succeed(requirement);
            return;
        }

        context.Fail(new AuthorizationFailureReason(this, "User is not authorized to add updates to this lead."));
    }
}
