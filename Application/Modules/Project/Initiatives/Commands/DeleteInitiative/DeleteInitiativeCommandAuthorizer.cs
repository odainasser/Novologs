
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Initiatives.Commands.DeleteInitiative;

public class DeleteInitiativeCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteInitiativeCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;
    public DeleteInitiativeCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteInitiativeCommand> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Projects.DeleteProjectInitiative);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete project initiative."));
            return;
        }
        else
        {
            var projectInitiative = await _context.GetSet<ProjectInitiative>()
                .FirstOrDefaultAsync(pi => pi.Id == requirement.Request!.Id, CancellationToken.None);

            if (projectInitiative == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Project initiative not found."));
                return;
            }

            if (projectInitiative.CreatedBy == _user.Id)
            {
                context.Succeed(requirement);
                return;
            }
            else
            {
                context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete this project initiative."));
                return;
            }
        }
    }

}
