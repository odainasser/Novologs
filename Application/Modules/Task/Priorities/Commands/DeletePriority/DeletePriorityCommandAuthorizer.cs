using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Priorities.Commands.DeletePriority;

public class DeletePriorityCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeletePriorityCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public DeletePriorityCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<DeletePriorityCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Tasks.DeleteTaskPriority);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete task priority."));
            return;
        }
        else
        {
            var priority = await _context.GetSet<Novologs.Domain.Entities.TaskPriority>()
                .FirstOrDefaultAsync(p => p.Id == requirement.Request!.Id);
            if (priority == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Priority not found."));
                return;
            }

            context.Succeed(requirement);
            return;
        }
    }
}
