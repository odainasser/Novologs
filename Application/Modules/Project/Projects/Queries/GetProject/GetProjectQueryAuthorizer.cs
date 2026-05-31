using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Project.Projects.Queries.GetProject;

public class GetProjectQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetProjectQuery>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetProjectQueryAuthorizer(
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
        ZetaAuthorizationRequirement<GetProjectQuery> requirement)
    {
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            context.Fail();
            return;
        }
        
        var hasGeneralViewAllPermission = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.General.ViewAll);
        if (hasGeneralViewAllPermission)
        {
            context.Succeed(requirement);
            return;
        }
        
        var hasProjectViewAllPermission = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.Projects.ViewAll);
        if (hasProjectViewAllPermission && (requirement.Request!.Type == ProjectType.Project || requirement.Request!.Type == ProjectType.Ticketing) )
        {
            context.Succeed(requirement);
            return;
        } 
        
        var hasMissionViewAllPermission = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.Missions.ViewAll);
        if (hasMissionViewAllPermission && requirement.Request!.Type == ProjectType.Mission)
        {
            context.Succeed(requirement);
            return;
        }
        
        //need project read permission
        var hasMissionPermission = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.Missions.Read);

        if (requirement.Request!.Type == ProjectType.Mission)
        {
            if (hasMissionPermission)
            {
                context.Succeed(requirement);
                return;
            }
        }

        var hasProjectPermission = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.Projects.Read);
        if (requirement.Request!.Type == ProjectType.Project || requirement.Request!.Type == ProjectType.Ticketing)
        {
            if (hasProjectPermission)
            {
                context.Succeed(requirement);
                return;
            }
        }
        var hasTicketingPermission = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.Ticketing.Read);
        if (requirement.Request!.Type == ProjectType.Ticketing)
        {
            if (hasTicketingPermission)
            {
                context.Succeed(requirement);
                return;
            }
        }

        if (requirement.Request!.Type == null)
        {
            if (hasMissionPermission && hasProjectPermission)
            {
                context.Succeed(requirement);
                return;
            }
        }
        
        context.Fail(new AuthorizationFailureReason(this, "User is not authorized to view this project."));
        return;
    }
}
