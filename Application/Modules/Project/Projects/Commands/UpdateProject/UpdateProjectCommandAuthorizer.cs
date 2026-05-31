using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Project.Projects.Commands.UpdateProject;

public class UpdateProjectCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<UpdateProjectCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public UpdateProjectCommandAuthorizer(
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
        ZetaAuthorizationRequirement<UpdateProjectCommand> requirement
    )
    {
            if (!Guid.TryParse(_user.Id, out var userId))
            {
                context.Fail();
                return;
            }

            var project = await _context.GetSet<Novologs.Domain.Entities.Project>()
                .Include(p => p.ProjectMembers)
                .FirstOrDefaultAsync(c => c.Id == requirement.Request!.Id, default);
            if (project == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Project not found."));
                return;
            }

            //only owner can Edit
            if (project.ProjectMembers.Any(pm => pm.MemberId == userId && pm.isOwner) || project.CreatorId == userId)
            {
                context.Succeed(requirement);
                return;
            }

            //or project creator
            // if (project.CreatorId == userId)
            // {
            //     context.Succeed(requirement);
            //     return;
            // }

            if (project.Type == ProjectType.Mission)
            {
                var hasMissionPermission = await _userManager.HasPermissionAsync(_context, userId,
                    Novologs.Domain.Constants.Permissions.Missions.Update);
                if (hasMissionPermission)
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            if (project.Type == ProjectType.Project)
            {
                var hasProjectPermission = await _userManager.HasPermissionAsync(_context, userId,
                    Novologs.Domain.Constants.Permissions.Projects.Update);
                if (hasProjectPermission)
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            if (project.Type == ProjectType.Ticketing)
            {
                var hasTicketingPermission = await _userManager.HasPermissionAsync(_context, userId,
                    Novologs.Domain.Constants.Permissions.Ticketing.Update);
                if (hasTicketingPermission)
                {
                    context.Succeed(requirement);
                    return;
                }
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to update this project."));
        }
}
