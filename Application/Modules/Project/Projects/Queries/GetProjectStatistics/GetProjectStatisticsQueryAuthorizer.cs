using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Project.Projects.Queries.GetProjectStatistics;

public class
    GetProjectStatisticsQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetProjectStatisticsQuery>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetProjectStatisticsQueryAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected async override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetProjectStatisticsQuery> requirement
    )
    {
        var hasPermission =
            await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Projects.Read);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read project statistics."));
            return;
        }

        if (!Guid.TryParse(_user.Id, out var userId))
        {
            context.Fail();
            return;
        }

        var project = await _context.GetSet<Novologs.Domain.Entities.Project>()
            .Include(p => p.ProjectMembers)
            .FirstOrDefaultAsync(c => c.Id == requirement.Request!.ProjectId, default);
        if (project == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Project not found."));
            return;
        }

        if (project.Type == ProjectType.Mission)
        {
            var hasMissionPermission = await _userManager.HasPermissionAsync(_context, userId,
                Novologs.Domain.Constants.Permissions.Missions.Read);
            if (!hasMissionPermission)
            {
                context.Fail(new AuthorizationFailureReason(this,
                    "User is not authorized to read mission statistics."));
                return;
            }
        }

        if (project.Type == ProjectType.Project)
        {
            var hasProjectPermission = await _userManager.HasPermissionAsync(_context, userId,
                Novologs.Domain.Constants.Permissions.Projects.Read);
            if (!hasProjectPermission)
            {
                context.Fail(new AuthorizationFailureReason(this,
                    "User is not authorized to read project statistics."));
                return;
            }
        }

        if (project.Type == ProjectType.Ticketing)
        {
            var hasTicketingPermission = await _userManager.HasPermissionAsync(_context, userId,
                Novologs.Domain.Constants.Permissions.Ticketing.Read);
            if (!hasTicketingPermission)
            {
                context.Fail(new AuthorizationFailureReason(this,
                    "User is not authorized to read ticketing statistics."));
                return;
            }
        }

        if (project.ProjectMembers.Any(pm => pm.MemberId == userId))
        {
            context.Succeed(requirement);
            return;
        }

        context.Fail(
            new AuthorizationFailureReason(this, "User is not authorized to read statistics for this project."));
        return;
    }
}
