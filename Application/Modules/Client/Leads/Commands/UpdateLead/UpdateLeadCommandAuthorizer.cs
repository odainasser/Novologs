
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Leads.Commands.UpdateLead;

public class UpdateLeadCommandAuthorizer : PermissionAuthorizationHandler<UpdateLeadCommand>
{
    private readonly IUser _user;

    public UpdateLeadCommandAuthorizer(
        UserManager<TenantUser> userManager,
        ITenantDbContext context,
        IUser user)
        : base(userManager, context, Novologs.Domain.Constants.Permissions.Clients.UpdateLead)
    {
        _user = user;
    }

    protected override async Task HandleAdditionalRequirementsAsync(
        AuthorizationHandlerContext context,
        Novologs.Application.Common.Behaviours.ZetaAuthorizationRequirement<UpdateLeadCommand> requirement)
    {
        //if user is the creator of lead then ok
        var lead = await Context.GetSet<Novologs.Domain.Entities.ClientLead>()
            .Include(l => l.LeadMembers)
            .FirstOrDefaultAsync(l => l.Id == requirement.Request!.Id, cancellationToken: CancellationToken.None);

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

        context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update lead."));
    }
}
