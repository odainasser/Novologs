using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Account.Common.Authorization;

/// <summary>
/// A single, generic IAuthorizationHandler that satisfies ZetaAuthorizationRequirement&lt;T&gt;
/// for any command/query record decorated with [AuthorizePermissionAttribute].
/// Registered automatically by AddAuthorizationFromAssembly — no per-command authorizer file needed.
/// </summary>
public class PermissionAttributeAuthorizationHandler : IAuthorizationHandler
{
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public PermissionAttributeAuthorizationHandler(
        UserManager<TenantUser> userManager,
        ITenantDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task HandleAsync(AuthorizationHandlerContext context)
    {
        foreach (var requirement in context.PendingRequirements.ToList())
        {
            var reqType = requirement.GetType();

            if (!reqType.IsGenericType ||
                reqType.GetGenericTypeDefinition() != typeof(ZetaAuthorizationRequirement<>))
                continue;

            var requestType = reqType.GetGenericArguments()[0];

            var attributes = requestType
                .GetCustomAttributes(typeof(AuthorizePermissionAttribute), true)
                .Cast<AuthorizePermissionAttribute>()
                .ToList();

            if (attributes.Count == 0)
                continue;

            bool allGranted = true;
            foreach (var attr in attributes)
            {
                var hasPermission = await context.User
                    .HasPermission(_userManager, _context, attr.Permission);

                if (!hasPermission)
                {
                    allGranted = false;
                    context.Fail(new AuthorizationFailureReason(
                        this, $"User does not have the '{attr.Permission}' permission."));
                    break;
                }
            }

            if (allGranted)
                context.Succeed(requirement);
        }
    }
}
