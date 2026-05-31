using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Tenant.Commands.ActivateDeactivateSsoLink;

public class
    ActivateDeactivateSsoLinkCommandAuthorizer : AuthorizationHandler<
    ZetaAuthorizationRequirement<ActivateDeactivateSsoLinkCommand>>
{
    private readonly IUser _user;
    private readonly ITenantDbContext _context;

    public ActivateDeactivateSsoLinkCommandAuthorizer(
        ITenantDbContext context,
        IUser user)
    {
        _context = context;
        _user = user;
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<ActivateDeactivateSsoLinkCommand> requirement
    )
    {
        if (requirement.Request!.LinkDirection == LinkDirection.To)
        {
            var linkTo = _context.GetSet<TenantUsersLinkedTo>().AsNoTracking().AsSplitQuery()
                .FirstOrDefault(l => l.Id == requirement.Request.LinkId && l.SourceUserId == _user.IdGuid);
            if (linkTo == null)
            {
                context.Fail(new AuthorizationFailureReason(this,
                    "SSO link not found or you don't have permission to modify it."));
                return System.Threading.Tasks.Task.CompletedTask;
            }
        }
        else if (requirement.Request.LinkDirection == LinkDirection.From)
        {
            var linkFrom = _context.GetSet<TenantUsersLinkedFrom>().AsNoTracking().AsSplitQuery()
                .FirstOrDefault(l => l.Id == requirement.Request.LinkId && l.TargetUserId == _user.IdGuid);
            if (linkFrom == null)
            {
                context.Fail(new AuthorizationFailureReason(this,
                    "SSO link not found or you don't have permission to modify it."));
                return System.Threading.Tasks.Task.CompletedTask;
            }
        }
        else
        {
            context.Fail(new AuthorizationFailureReason(this, "Invalid link direction."));
            return System.Threading.Tasks.Task.CompletedTask;
        }

        context.Succeed(requirement);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
