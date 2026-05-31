using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Tasks.TodoItems.Commands.AddTodoItem;

public class AddTodoItemCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<AddTodoItemCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public AddTodoItemCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<AddTodoItemCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Tasks.UpdateTask);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to add todo item."));
            return;
        }
        else
        {
            if (requirement.Request!.TaskId.HasValue)
            {
                var task = await _context.GetSet<ProjectTask>()
                    .Include(t => t.Members)
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == requirement.Request!.TaskId);

                if (task == null)
                {
                    context.Fail(new AuthorizationFailureReason(this, "Task not found."));
                    return;
                }

                if (task.Project?.Type == ProjectType.Ticketing)
                {
                    context.Fail(new AuthorizationFailureReason(this, "Cannot add todo items to ticketing tasks."));
                    return;
                }

                if (task.CreatorId == _user.IdGuid || task.Members.Any(m => m.MemberId == _user.IdGuid))
                {
                    context.Succeed(requirement);
                    return;
                }
                else
                {
                    context.Fail(new AuthorizationFailureReason(this,
                        "User is not authorized to add todo items to this task."));
                    return;
                }
            }
            else
            {
                context.Succeed(requirement);
                return;
            }
        }
    }
}
