using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Tenant.Queries.GetTenantSsoLinks;

public class GetTenantSsoLinksQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetTenantSsoLinksQuery>>
{
    public GetTenantSsoLinksQueryAuthorizer()
    {
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetTenantSsoLinksQuery> requirement)
    {
        context.Succeed(requirement);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}