using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Goals.Commands.UpdateGoal;

public class UpdateGoalCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateGoalCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public UpdateGoalCommandAuthorizer(
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
        ZetaAuthorizationRequirement<UpdateGoalCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Projects.UpdateProjectGoal);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update project goal."));
            return;
        }
        else
        {
            var projectGoal = await _context.GetSet<ProjectGoal>()
                .FirstOrDefaultAsync(pg => pg.Id == requirement.Request!.Id, CancellationToken.None);

            if (projectGoal == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Project goal not found."));
                return;
            }

            if (projectGoal.CreatedBy == _user.Id)
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update this project goal."));
            }
        }
    }
}
