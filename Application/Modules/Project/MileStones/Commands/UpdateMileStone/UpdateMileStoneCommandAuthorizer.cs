using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.MileStones.Commands.UpdateMileStone;

public class
    UpdateMileStoneCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateMileStoneCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public UpdateMileStoneCommandAuthorizer(
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
        ZetaAuthorizationRequirement<UpdateMileStoneCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Milestones.Update);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update milestone."));
            return;
        }

        var milestone = await _context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
            .FirstOrDefaultAsync(m => m.Id == requirement.Request!.Id, CancellationToken.None);

        if (milestone == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Milestone not found."));
            return;
        }

        var project = await _context.GetSet<Novologs.Domain.Entities.Project>()
            .Include(p => p.ProjectMembers)
            .FirstOrDefaultAsync(p => p.Id == milestone.ProjectId);

        if (project == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Project not found."));
            return;
        }

        var isOwner = project.ProjectMembers.Any(pm => pm.MemberId == Guid.Parse(_user.Id!) && pm.isOwner);

        if (!isOwner)
        {
            context.Fail(new AuthorizationFailureReason(this, "Only project owners can update milestones."));
            return;
        }

        context.Succeed(requirement);
    }
}
