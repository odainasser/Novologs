
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Leads.Commands.ChangeLeadStatus;

public class ChangeLeadStatusCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<ChangeLeadStatusCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    
    public ChangeLeadStatusCommandAuthorizer(
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
        ZetaAuthorizationRequirement<ChangeLeadStatusCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Clients.ChangeLeadStatus);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to change lead status."));
            return;
        }

        //if user is the creator of lead then ok
        var lead = await _context.GetSet<Novologs.Domain.Entities.ClientLead>()
            .Include(l => l.LeadMembers)
            .FirstOrDefaultAsync(l => l.Id == requirement.Request!.Id, cancellationToken: CancellationToken.None);

        if (lead == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Lead not found."));
            return;
        }

        var isCreator = lead.CreatedBy == _user.Id;
        var hasMemberChangeStatusPermission = lead.LeadMembers
            .Any(lm => lm.MemberId == _user.IdGuid 
                       && !lm.IsDeleted 
                       && lm.PermissionLevel.HasFlag(LeadMemberPermission.ChangeStatus));

        if (isCreator || hasMemberChangeStatusPermission)
        {
            context.Succeed(requirement);
            return;
        }

        context.Fail(new AuthorizationFailureReason(this, "User is not authorized to change lead status."));
    }
}
