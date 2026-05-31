using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Project.Projects.Commands.AddProject;

public class AddProjectCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<AddProjectCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public AddProjectCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<AddProjectCommand> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Projects.Create);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to create project."));
            return;
        }
        else
        {
            if (!Guid.TryParse(_user.Id, out var userId))
            {
                context.Fail(new AuthorizationFailureReason(this, "User ID is invalid."));
                return;
            }

            if (requirement.Request!.Type == ProjectType.Mission)
            {
                var hasMissionPermission = await _userManager.HasPermissionAsync(_context, userId,
                    Novologs.Domain.Constants.Permissions.Missions.Create);
                if (hasMissionPermission)
                {
                    context.Succeed(requirement);
                    return;
                }
                else
                {
                    context.Fail(new AuthorizationFailureReason(this, "User is not authorized to create missions."));
                    return;
                }
            }
            
            if (requirement.Request!.Type == ProjectType.Project)
            {
                var hasProjectPermission = await _userManager.HasPermissionAsync(_context, userId,
                    Novologs.Domain.Constants.Permissions.Projects.Create);
                if (hasProjectPermission)
                {
                    context.Succeed(requirement);
                    return;
                }
                else
                {
                    context.Fail(new AuthorizationFailureReason(this, "User is not authorized to create projects."));
                    return;
                }
            }
            
            if (requirement.Request!.Type == ProjectType.Ticketing)
            {
                var hasTicketingPermission = await _userManager.HasPermissionAsync(_context, userId,
                    Novologs.Domain.Constants.Permissions.Ticketing.Create);
                if (hasTicketingPermission)
                {
                    context.Succeed(requirement);
                    return;
                }
                else
                {
                    context.Fail(new AuthorizationFailureReason(this, "User is not authorized to create tickets."));
                    return;
                }
            }
        }
    }
}
