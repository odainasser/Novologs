using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Common.Authorization;

/// <summary>
/// Abstract base handler that gates every command/query behind a single permission check.
/// Subclasses that only need the permission check require no override â€” the requirement is
/// succeeded automatically.  Subclasses that need extra logic (e.g. ownership checks) override
/// <see cref="HandleAdditionalRequirementsAsync"/>.
/// </summary>
public abstract class PermissionAuthorizationHandler<TRequest>
    : AuthorizationHandler<ZetaAuthorizationRequirement<TRequest>>
{
    private readonly string _permission;

    protected readonly UserManager<TenantUser> UserManager;
    protected readonly ITenantDbContext Context;

    protected PermissionAuthorizationHandler(
        UserManager<TenantUser> userManager,
        ITenantDbContext context,
        string permission)
    {
        UserManager = userManager;
        Context = context;
        _permission = permission;
    }

    protected sealed override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<TRequest> requirement)
    {
        var hasPermission = await context.User.HasPermission(UserManager, Context, _permission);
        if (!hasPermission)
        {
            context.Fail(new AuthorizationFailureReason(this, $"User does not have the '{_permission}' permission."));
            return;
        }

        await HandleAdditionalRequirementsAsync(context, requirement);
    }

    /// <summary>
    /// Override this method to add extra authorization checks after the permission gate passes.
    /// The default implementation immediately succeeds the requirement.
    /// </summary>
    protected virtual Task HandleAdditionalRequirementsAsync(
        AuthorizationHandlerContext context,
        ZetaAuthorizationRequirement<TRequest> requirement)
    {
        context.Succeed(requirement);
        return Task.CompletedTask;
    }
}
