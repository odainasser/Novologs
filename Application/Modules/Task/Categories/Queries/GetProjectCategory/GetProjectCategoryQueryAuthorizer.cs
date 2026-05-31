using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Categories.Queries.GetProjectCategory;

using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;

public class
    GetProjectCategoryQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetProjectCategoryQuery>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetProjectCategoryQueryAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetProjectCategoryQuery> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Tasks.ReadTaskCategory);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read project category."));
            return;
        }
        else
        {
            if (_user.Id == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "User not authenticated."));
                return;
            }

            if (requirement.Request!.ProjectId == null)
            {
                context.Succeed(requirement);
                return;
            }

            var project = await _context.GetSet<Novologs.Domain.Entities.Project>()
                .AsNoTracking()
                .Include(p => p.ProjectMembers)
                .FirstOrDefaultAsync(p => p.Id == requirement.Request!.ProjectId);

            if (project == null)
            {
                context.Fail(new AuthorizationFailureReason(this, "Project not found."));
                return;
            }

            if (project.CreatorId == _user.IdGuid ||
                project.ProjectMembers.Any(m => m.MemberId == _user.IdGuid) ||
                await context.User.HasPermission(_userManager, _context, Novologs.Domain.Constants.Permissions.Projects.ViewAll))
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail(new AuthorizationFailureReason(this,
                    "User is not authorized to view categories for this project."));
            }
        }
    }
}
