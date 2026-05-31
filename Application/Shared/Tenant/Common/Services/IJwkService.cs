using Microsoft.IdentityModel.Tokens;
using Novologs.Domain.Entities;

namespace Novologs.Application.Common.Services;

public interface IJwkService
{
    RsaSecurityKey Key { get; }
    JsonWebKeySet GetJsonWebKeySet();
    Task<string> GenerateSsoToken(Guid userId, string audience);
    Task<(string token, DateTime expiration, Guid jti)> GenerateAppToken(TenantUser user);
}