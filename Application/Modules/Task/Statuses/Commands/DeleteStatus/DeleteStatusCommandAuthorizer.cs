using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Statuses.Commands.DeleteStatus;

public class DeleteStatusCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteStatusCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public DeleteStatusCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<DeleteStatusCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Tasks.DeleteTaskStatus);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete task status."));
            return;
        }
        else
        {
            var status = await _context.GetSet<Novologs.Domain.Entities.TaskStatus>()
                .FirstOrDefaultAsync(s => s.Id == requirement.Request!.Id);
            if (status == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Status not found."));
                return;
            }

            if (status.Status == Novologs.Domain.Enums.ProjectTaskStatus.NotStarted ||
                status.Status == Novologs.Domain.Enums.ProjectTaskStatus.InProgress ||
                status.Status == Novologs.Domain.Enums.ProjectTaskStatus.OnHold ||
                status.Status == Novologs.Domain.Enums.ProjectTaskStatus.Submitted ||
                status.Status == Novologs.Domain.Enums.ProjectTaskStatus.Completed)
            {
                context.Fail(new AuthorizationFailureReason(this, "Cannot delete default task statuses."));
                return;
            }

            context.Succeed(requirement);
            return;
        }
    }
}
