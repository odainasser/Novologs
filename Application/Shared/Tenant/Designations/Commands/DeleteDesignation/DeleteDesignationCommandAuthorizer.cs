using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Designations.Commands.DeleteDesignation;

public class
    DeleteDesignationCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteDesignationCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public DeleteDesignationCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteDesignationCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Domain.Constants.Permissions.Users.DeleteDesignation);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete designation."));
            return;
        }
        else
        {
            var designation = await _context.GetSet<Designation>()
                .FirstOrDefaultAsync(c => c.Id == requirement.Request!.Id);
            if (designation == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Designation not found."));
                return;
            }

            context.Succeed(requirement);
        }
    }
}
