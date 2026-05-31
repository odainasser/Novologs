using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Modules.Tasks.Tasks.Commands.DeleteTask;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Tasks.Commands.DeleteTask;

public class DeleteTaskCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteTaskCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public DeleteTaskCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<DeleteTaskCommand> requirement)
    {
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            context.Fail(new AuthorizationFailureReason(this, "User ID is invalid."));
            return;
        }

        var taskToDelete = await _context.GetSet<Novologs.Domain.Entities.ProjectTask>()
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == requirement.Request!.Id);

        if (taskToDelete == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Task not found."));
            return;
        }

        if (taskToDelete.Project != null && taskToDelete.Project.Type == Novologs.Domain.Enums.ProjectType.Ticketing)
        {
            if (taskToDelete.CreatorId == userId)
            {
                //TODO discuss with Mr.Nowshad
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "Only the creator can delete this ticket."));
            return;
        }
        else
        {
            var hasPermission = await context.User.HasPermission(_userManager, _context,
                Novologs.Domain.Constants.Permissions.Tasks.DeleteTask);
            if (!hasPermission)
            {
                context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete task."));
                return;
            }

            if (taskToDelete.CreatorId != userId)
            {
                context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete this task."));
                return;
            }

            context.Succeed(requirement);
            return;
        }
    }
}
