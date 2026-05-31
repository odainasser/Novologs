using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Departments.Commands.UpdateDepartment;

public class
    UpdateDepartmentCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateDepartmentCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public UpdateDepartmentCommandAuthorizer(
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
        ZetaAuthorizationRequirement<UpdateDepartmentCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Domain.Constants.Permissions.Users.UpdateDepartment);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update department."));
            return;
        }
        else
        {
            var department = await _context.GetSet<Department>()
                .FirstOrDefaultAsync(c => c.Id == requirement.Request!.Id);
            if (department == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Department not found."));
                return;
            }

            context.Succeed(requirement);
        }
    }
}
