
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Finance.Timesheets.Commands.DeleteTimesheet;

public class DeleteTimesheetCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteTimesheetCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;
    
    public DeleteTimesheetCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteTimesheetCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Finance.DeleteTimesheet);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete timesheet."));
            return;
        }
        else
        {
            var timesheet = await _context.GetSet<Novologs.Domain.Entities.TimeSheet>()
                .FirstOrDefaultAsync(t => t.Id == requirement.Request!.Id, CancellationToken.None);

            if (timesheet != null && timesheet.CreatedBy == _user.Id)
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete timesheets."));
            return;
        }
    }
}
