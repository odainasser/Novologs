using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;

namespace Novologs.Application.Tenant.Commands.DeleteTenantSsoLink;

public class DeleteTenantSsoLinkCommandAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<DeleteTenantSsoLinkCommand>>
{
    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<DeleteTenantSsoLinkCommand> requirement
    )
    {
        context.Succeed(requirement);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
