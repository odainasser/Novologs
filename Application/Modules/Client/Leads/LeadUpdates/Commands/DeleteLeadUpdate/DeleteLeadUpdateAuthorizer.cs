using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Leads.LeadUpdates.Commands.DeleteLeadUpdate;

public class DeleteLeadUpdateAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteLeadUpdateCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public DeleteLeadUpdateAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteLeadUpdateCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Clients.DeleteLeadUpdate);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete lead updates."));
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
        var hasMemberDeletePermission = leadUpdate.Lead.LeadMembers
            .Any(lm => lm.MemberId == _user.IdGuid
                       && !lm.IsDeleted
                       && lm.PermissionLevel.HasFlag(LeadMemberPermission.Delete));

        if (isCreator || hasMemberDeletePermission)
        {
            context.Succeed(requirement);
            return;
        }

        context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete this lead update."));
    }
}
