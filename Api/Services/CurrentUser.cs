using System.Security.Claims;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Api.Services;

/// <summary>Resolves the current user's id from the request's claims.</summary>
public class CurrentUser : IUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor) => _httpContextAccessor = httpContextAccessor;

    private string? _id;

    public string? Id
    {
        get => _id ??= _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        set => _id = value;
    }

    public string? Tenant { get; set; }
}
