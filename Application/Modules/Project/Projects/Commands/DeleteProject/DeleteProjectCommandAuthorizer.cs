using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Project.Projects.Commands.DeleteProject;

public class DeleteProjectCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteProjectCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public DeleteProjectCommandAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    //archive project
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<DeleteProjectCommand> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Projects.Delete);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete project."));
            return;
        }
        else
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

            if (project.Type == ProjectType.Mission)
            {
                var hasMissionPermission = await _userManager.HasPermissionAsync(_context, userId,
                    Novologs.Domain.Constants.Permissions.Missions.Delete);
                if (!hasMissionPermission)
                {
                    context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete missions."));
                    return;
                }
            }

            if (project.Type == ProjectType.Project)
            {
                var hasProjectPermission = await _userManager.HasPermissionAsync(_context, userId,
                    Novologs.Domain.Constants.Permissions.Projects.Delete);
                if (!hasProjectPermission)
                {
                    context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete projects."));
                    return;
                }
            }

            if (project.Type == ProjectType.Ticketing)
            {
                var hasTicketingPermission = await _userManager.HasPermissionAsync(_context, userId,
                    Novologs.Domain.Constants.Permissions.Ticketing.Delete);
                if (!hasTicketingPermission)
                {
                    context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete tickets."));
                    return;
                }
            }

            //only owner can Edit
            if (project.ProjectMembers.Any(pm => pm.MemberId == userId && pm.isOwner))
            {
                context.Succeed(requirement);
                return;
            }

            //or mission creator
            if (project.Type == ProjectType.Mission && project.CreatorId == userId)
            {
                context.Succeed(requirement);
                return;
            }

            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete this project."));
        }
    }
}
