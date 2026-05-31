using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Tenant.Commands.GenerateSsoToken;

public class
    GenerateSsoTokenCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GenerateSsoTokenCommand>>
{
    private readonly IUser _user;
    private readonly ITenantDbContext _context;

    public GenerateSsoTokenCommandAuthorizer(
        ITenantDbContext context,
        IUser user)
    {
        _context = context;
        _user = user;
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GenerateSsoTokenCommand> requirement
    )
    {
        var link = _context.GetSet<Domain.Entities.TenantUsersLinkedTo>().AsNoTracking().AsSplitQuery()
            .FirstOrDefault(l =>
                l.Id == requirement.Request!.TenantUsersLinkedToId && l.SourceUserId == _user.IdGuid);
        if (link == null)
        {
            context.Fail(new AuthorizationFailureReason(this,
                "SSO link not found or you don't have permission to generate token for it."));
            return System.Threading.Tasks.Task.CompletedTask;
        }

        context.Succeed(requirement);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
