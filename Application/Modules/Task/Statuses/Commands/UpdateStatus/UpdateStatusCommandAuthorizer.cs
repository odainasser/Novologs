using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Statuses.Commands.UpdateStatus;

public class UpdateStatusCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateStatusCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public UpdateStatusCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<UpdateStatusCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Tasks.UpdateTaskStatus);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update task status."));
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

            context.Succeed(requirement);
            return;
        }
    }
}
