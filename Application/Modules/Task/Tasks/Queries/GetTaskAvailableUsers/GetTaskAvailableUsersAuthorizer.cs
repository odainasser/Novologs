using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Application.User.Dto;
using Novologs.Domain.Constants;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Tasks.Queries.GetTaskAvailableUsers;

public class
    GetTaskAvailableUsersQueryAuthorizer : AuthorizationHandler<
    ZetaAuthorizationRequirement<GetTaskAvailableUsersQuery>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetTaskAvailableUsersQueryAuthorizer(
        ITenantDbContext context,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetTaskAvailableUsersQuery> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Permissions.Tasks.ReadTask);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read tasks."));
            return;
        }

        if (requirement.Request!.EmployeeId == null || requirement.Request.EmployeeId == _user.IdGuid)
        {
            context.Succeed(requirement);
            return;
        }

        var organizationStructure = await _context.GetSet<OrganizationStructure>()
            .Include(d => d.Children)
            .AsSingleQuery().AsNoTracking()
            .ToListAsync();

        var currentUserNode = organizationStructure
            .FirstOrDefault(d => d.EmployeeId == _user.IdGuid);

        if (currentUserNode == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Current user not found in organization structure."));
            return;
        }

        var allDescendantsIds = HierarchUtil.GetAllDescendantEmployeesIds(currentUserNode)
            .Select(id => (Guid?)id)
            .ToList();

        if (allDescendantsIds.Contains(requirement.Request.EmployeeId))
        {
            context.Succeed(requirement);
            return;
        }

        context.Fail(new AuthorizationFailureReason(this,
            "User is not authorized to view available users for the specified employee."));
    }
}
