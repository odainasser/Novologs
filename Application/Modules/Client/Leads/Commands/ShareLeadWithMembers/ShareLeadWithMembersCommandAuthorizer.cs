using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Constants;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.Leads.Commands.ShareLeadWithMembers;

public class ShareLeadWithMembersCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<ShareLeadWithMembersCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public ShareLeadWithMembersCommandAuthorizer(
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
        ZetaAuthorizationRequirement<ShareLeadWithMembersCommand> requirement)
    {

        // Check if user has ShareLead or ManageLeadMembers permission
        var hasSharePermission = await context.User.HasPermission(_userManager, _context, Permissions.Clients.ShareLead);
        var hasManagePermission = await context.User.HasPermission(_userManager, _context, Permissions.Clients.ManageLeadMembers);

        if (!hasSharePermission && !hasManagePermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User does not have permission to share leads."));
            return;
        }

        // Verify the user is the creator of the lead
        var isCreator = await _context.GetSet<ClientLead>()
            .AnyAsync(l => l.Id == requirement.Request!.LeadId && l.CreatorId == _user.IdGuid);

        if (!isCreator)
        {
            context.Fail(new AuthorizationFailureReason(this, "Only the lead creator can share the lead."));
            return;
        }

        context.Succeed(requirement);
    }
}
