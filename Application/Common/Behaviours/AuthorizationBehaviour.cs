using System.Reflection;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Novologs.Application.Common.Exceptions;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Common.Behaviours;

/// <summary>
/// MediatR pipeline step that runs the matching authorizer for each request via
/// ASP.NET Core's <see cref="IAuthorizationService"/>. On failure, returns a
/// <see cref="Result{T}"/> failure when the response is one, otherwise throws.
/// </summary>
public class AuthorizationBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IAuthorizationService _authorizationService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthorizationBehaviour(IAuthorizationService authorizationService, IHttpContextAccessor httpContextAccessor)
    {
        _authorizationService = authorizationService;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (_httpContextAccessor.HttpContext?.User is null)
        {
            throw new ForbiddenAccessException();
        }

        var result = await _authorizationService.AuthorizeAsync(_httpContextAccessor.HttpContext.User, null,
            new ZetaAuthorizationRequirement<TRequest>(request));

        if (!result.Succeeded)
        {
            if (typeof(TResponse).IsGenericType && typeof(TResponse).GetGenericTypeDefinition() == typeof(Result<>))
            {
                var reasons = result.Failure!.FailureReasons
                    .Select(f => (f as AuthorizationFailureReason)?.Message)
                    .Where(m => m != null);
                var errorMessages = reasons.Any() ? string.Join(" ", reasons) : "Authorization failed.";

                var resultType = typeof(TResponse).GetGenericArguments()[0];
                var failureMethod = typeof(Result<>)
                    .MakeGenericType(resultType)
                    .GetMethod(nameof(Result<object>.Failure), BindingFlags.Public | BindingFlags.Static, null,
                        new[] { typeof(string), typeof(string) }, null);

                if (failureMethod != null)
                {
                    return (TResponse)failureMethod.Invoke(null, new object[] { "Authorization", errorMessages })!;
                }
            }

            throw new UnauthorizedAccessException("Authorization failed.");
        }

        return await next();
    }
}
