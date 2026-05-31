using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Project.MileStones.Queries.GetMileStone;

public class GetMileStoneQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetMileStoneQuery>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetMileStoneQueryAuthorizer(
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
        ZetaAuthorizationRequirement<GetMileStoneQuery> requirement)
    {
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            context.Fail();
            return;
        }

        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Milestones.Read);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read milestone."));
            return;
        }

        var isProjectMember = await _context.GetSet<Novologs.Domain.Entities.ProjectMember>()
            .AnyAsync(pm => pm.ProjectId == requirement.Request!.ProjectId && pm.MemberId == _user.IdGuid,
                CancellationToken.None);

        if (isProjectMember)
        {
            context.Succeed(requirement);
            return;
        }

        var hasGeneralViewAllPermission = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.General.ViewAll);
        if (hasGeneralViewAllPermission)
        {
            context.Succeed(requirement);
            return;
        }

        var project = await _context.GetSet<Novologs.Domain.Entities.Project>()
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == requirement.Request!.ProjectId, CancellationToken.None);

        if (project == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Project not found."));
            return;
        }

        if (project.Type == ProjectType.Mission)
        {
            var hasMissionViewAllPermission = await _userManager.HasPermissionAsync(_context, userId,
                Novologs.Domain.Constants.Permissions.Missions.ViewAll);
            if (hasMissionViewAllPermission)
            {
                context.Succeed(requirement);
                return;
            }
        }
        else
        {
            var hasProjectViewAllPermission = await _userManager.HasPermissionAsync(_context, userId,
                Novologs.Domain.Constants.Permissions.Projects.ViewAll);
            if (hasProjectViewAllPermission)
            {
                context.Succeed(requirement);
                return;
            }
        }

        var hasGeneralViewAll = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.General.ViewAll);
        if (hasGeneralViewAll)
        {
            context.Succeed(requirement);
            return;
        }


        context.Fail(new AuthorizationFailureReason(this, "User is not authorized to view this milestone."));
    }
}
