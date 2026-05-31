using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Application.UserGroups.Commands.DeleteUserGroup;
using Novologs.Domain.Entities;

namespace Novologs.Application.UserGroups.Commands.DeleteUserGroup;

public class
    DeleteUserGroupCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteUserGroupCommand>>
{
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;


    public DeleteUserGroupCommandAuthorizer(
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
        ZetaAuthorizationRequirement<DeleteUserGroupCommand> requirement
    )
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context, Domain.Constants.Permissions.UserSalesGroup.DeleteUserGroup);
        if (! hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete user group."));
            return;
        }
        else
        {
            if (await _context.GetSet<UserGroup>()
                         .AnyAsync(ug => ug.Id == requirement.Request!.Id && ug.CreatedBy == _user.IdGuid.ToString(),
                             cancellationToken: default))
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail(new AuthorizationFailureReason(this, "User is not authorized to delete user groups."));
            }
        }
    }
}
