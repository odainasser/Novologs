using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Constants;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Leads.Commands.UpdateLeadMemberPermission;

public class UpdateLeadMemberPermissionCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateLeadMemberPermissionCommand>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public UpdateLeadMemberPermissionCommandAuthorizer(
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
        ZetaAuthorizationRequirement<UpdateLeadMemberPermissionCommand> requirement)
    {
        // Check if user has ManageLeadMembers permission
        var hasManagePermission = await context.User.HasPermission(_userManager, _context, Permissions.Clients.ManageLeadMembers);
        if (!hasManagePermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User does not have permission to manage lead members."));
            return;
        }

        // Verify the user is the creator of the lead OR has ManageMembers permission for this lead
        var lead = await _context.GetSet<ClientLead>()
            .Include(l => l.LeadMembers)
            .FirstOrDefaultAsync(l => l.Id == requirement.Request!.LeadId);

        if (lead == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Lead not found."));
            return;
        }

        var isCreator = lead.CreatorId == _user.IdGuid;
        var hasManageMembersPermission = lead.LeadMembers
            .Any(lm => lm.MemberId == _user.IdGuid 
                       && !lm.IsDeleted 
                       && lm.PermissionLevel.HasFlag(LeadMemberPermission.ManageMembers));

        if (isCreator || hasManageMembersPermission)
        {
            context.Succeed(requirement);
            return;
        }

        context.Fail(new AuthorizationFailureReason(this, "Only the lead creator or members with ManageMembers permission can update member permissions."));
    }
}
