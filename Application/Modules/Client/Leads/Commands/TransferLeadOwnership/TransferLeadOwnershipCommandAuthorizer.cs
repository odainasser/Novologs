using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.Leads.Commands.TransferLeadOwnership;

public class TransferLeadOwnershipCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<TransferLeadOwnershipCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public TransferLeadOwnershipCommandAuthorizer(
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
        ZetaAuthorizationRequirement<TransferLeadOwnershipCommand> requirement)
    {
        // Only the lead creator can transfer ownership
        var lead = await _context.GetSet<ClientLead>()
            .FirstOrDefaultAsync(l => l.Id == requirement.Request!.LeadId);

        if (lead == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Lead not found."));
            return;
        }

        if (lead.CreatorId != _user.IdGuid)
        {
            context.Fail(new AuthorizationFailureReason(this, "Only the lead creator can transfer ownership."));
            return;
        }

        context.Succeed(requirement);
    }
}
