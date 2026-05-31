using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.MileStones.Commands.AddTasksToMileStone;

public class
    AddTasksToMileStoneCommandAuthorizer : AuthorizationHandler<
    ZetaAuthorizationRequirement<AddTasksToMileStoneCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public AddTasksToMileStoneCommandAuthorizer(
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
        ZetaAuthorizationRequirement<AddTasksToMileStoneCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Milestones.Update);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to add tasks to milestone."));
            return;
        }
        else
        {
            //user should be member of milestone project
            if (requirement.Request!.MileStoneId.HasValue)
            {
                var milestone = await _context.GetSet<ProjectMileStone>()
                    .FirstOrDefaultAsync(m => m.Id == requirement.Request.MileStoneId.Value, CancellationToken.None);

                if (milestone != null)
                {
                    var isProjectMember = await _context.GetSet<ProjectMember>()
                        .AnyAsync(pm => pm.ProjectId == milestone.ProjectId && pm.MemberId == _user.IdGuid,
                            CancellationToken.None);

                    if (!isProjectMember)
                    {
                        context.Fail(new AuthorizationFailureReason(this,
                            "User is not a member of the project associated with this milestone."));
                        return;
                    }
                }
            }

            context.Succeed(requirement);
        }
    }
}
