using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.WorkStatuss.Queries.GetWorkStatus;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.WorkStatuss.Queries.GetWorkStatus;

public class GetWorkStatusQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetWorkStatusQuery>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly UserManager<TenantUser> _userManager;

    public GetWorkStatusQueryAuthorizer(ITenantDbContext context, IUser user, IMapper mapper,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
        _userManager = userManager;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetWorkStatusQuery> requirement)
    {
        var hasPermission = await context.User.HasPermission(_userManager, _context,
            Domain.Constants.Permissions.Users.ReadEmployeeStatus);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, "User is not authorized to read work status."));
            return;
        }
        else
        {
            context.Succeed(requirement);
            return;
        }
    }
}
