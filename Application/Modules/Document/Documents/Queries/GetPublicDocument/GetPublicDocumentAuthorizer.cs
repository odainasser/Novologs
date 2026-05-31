using Novologs.Application.Common.Authorization;
using Novologs.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Novologs.Application.Common.Behaviours;
using Microsoft.AspNetCore.Identity;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Document.Documents.Queries.GetPublicDocument;

public class
    GetPublicDocumentQueryAuthorizer : AuthorizationHandler<ZetaAuthorizationRequirement<GetPublicDocumentQuery>>
{
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetPublicDocumentQueryAuthorizer(
        UserManager<TenantUser> userManager,
        ITenantDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }


    protected override System.Threading.Tasks.Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<GetPublicDocumentQuery> requirement
    )
    {
        context.Succeed(requirement);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
