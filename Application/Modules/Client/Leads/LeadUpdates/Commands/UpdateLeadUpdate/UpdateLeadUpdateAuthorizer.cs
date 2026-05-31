using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Leads.LeadUpdates.Commands.UpdateLeadUpdate;

public class UpdateLeadUpdateAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateLeadUpdateCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public UpdateLeadUpdateAuthorizer(
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
        ZetaAuthorizationRequirement<UpdateLeadUpdateCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Clients.UpdateLeadUpdate);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update lead updates."));
            return;
        }

        var leadUpdate = await _context.GetSet<LeadUpdate>()
            .Include(lu => lu.Lead)
                .ThenInclude(l => l!.LeadMembers)
            .FirstOrDefaultAsync(lu => lu.Id == requirement.Request!.Id, cancellationToken: CancellationToken.None);

        if (leadUpdate == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Lead update not found."));
            return;
        }

        if (leadUpdate.Lead == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Associated lead not found."));
            return;
        }

        var isCreator = leadUpdate.Lead.CreatedBy == _user.Id;
        var hasMemberUpdatePermission = leadUpdate.Lead.LeadMembers
            .Any(lm => lm.MemberId == _user.IdGuid
                       && !lm.IsDeleted
                       && lm.PermissionLevel.HasFlag(LeadMemberPermission.Update));

        if (isCreator || hasMemberUpdatePermission)
        {
            context.Succeed(requirement);
            return;
        }

        context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update this lead update."));
    }
}
