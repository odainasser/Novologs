using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.WorkStatuss.Commands.UpdateWorkStatus;
using Novologs.Domain.Entities;

namespace Novologs.Application.WorkStatuss.Commands.UpdateWorkStatus;

public class
    UpdateWorkStatusCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateWorkStatusCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public UpdateWorkStatusCommandAuthorizer(
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
        ZetaAuthorizationRequirement<UpdateWorkStatusCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Domain.Constants.Permissions.Users.UpdateEmployeeStatus);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update work status."));
            return;
        }
        else
        {
            var workStatus = await _context.GetSet<WorkStatus>()
                .FirstOrDefaultAsync(c => c.Id == requirement.Request!.Id);
            if (workStatus == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Work status not found."));
                return;
            }
            
            context.Succeed(requirement);
            return;
        }
    }
}
