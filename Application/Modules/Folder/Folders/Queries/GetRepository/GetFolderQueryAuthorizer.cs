using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Folder.Folders.Queries.GetRepository;

public class GetRepositoryQueryAuthorizer
    : AuthorizationHandler<ZetaAuthorizationRequirement<GetRepositoryQuery>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetRepositoryQueryAuthorizer(
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
        ZetaAuthorizationRequirement<GetRepositoryQuery> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Novologs.Domain.Constants.Permissions.Folders.ReadFolder);

        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read folder."));
            return;
        }

        if (_user.Id == null)
        {
            context.Fail(new AuthorizationFailureReason(this, "User not authenticated."));
            return;
        }

        context.Succeed(requirement);
    }
}
