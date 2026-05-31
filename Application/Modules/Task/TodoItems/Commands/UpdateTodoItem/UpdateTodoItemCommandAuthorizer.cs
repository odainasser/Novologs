
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.TodoItems.Commands.UpdateTodoItem;

public class UpdateTodoItemCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateTodoItemCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;
    
    public UpdateTodoItemCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<UpdateTodoItemCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Tasks.UpdateTask);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update todo item."));
            return;
        }
        else
        {
            var todoItem = await _context.GetSet<Novologs.Domain.Entities.TodoItem>()
                .FirstOrDefaultAsync(t => t.Id == requirement.Request!.Id);

            if (todoItem == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "TodoItem not found."));
                return;
            }

            if (todoItem.CreatedBy == _user.Id)
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update this todo item."));
            }
        }
    }
}
