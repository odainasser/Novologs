
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Designations.Commands.UpdateDesignation;

public class UpdateDesignationCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateDesignationCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public UpdateDesignationCommandAuthorizer(
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
        ZetaAuthorizationRequirement<UpdateDesignationCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.Users.UpdateDesignation);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update designation."));
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
