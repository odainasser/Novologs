using Microsoft.AspNetCore.Authorization;

namespace Novologs.Application.Common.Behaviours;

/// <summary>
/// Carries a MediatR request to the matching authorization handler so per-use-case
/// authorizers (<c>AuthorizationHandler&lt;ZetaAuthorizationRequirement&lt;TCommand&gt;&gt;</c>)
/// can assert the required permission.
/// </summary>
public class ZetaAuthorizationRequirement<TRequest> : IAuthorizationRequirement
{
    public TRequest Request { get; }

    public ZetaAuthorizationRequirement(TRequest request) => Request = request;
}
