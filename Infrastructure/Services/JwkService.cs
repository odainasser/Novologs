using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Novologs.Domain.Entities;
using System.IO;
using System.Security.Cryptography;
using Novologs.Application.Common.Services;

namespace Novologs.Infrastructure.Services;

public class JwkService : IJwkService
{
    public RsaSecurityKey Key { get; }
    private readonly string _keyId;
    private readonly IConfiguration _configuration;
    private readonly IServiceProvider _serviceProvider;

    public JwkService(
        IConfiguration configuration,
        IServiceProvider serviceProvider)
    {
        _configuration = configuration;
        _serviceProvider = serviceProvider;

        var privateKeyPath = configuration["JWT:PrivateKeyPath"];
        if (string.IsNullOrEmpty(privateKeyPath))
        {
            throw new InvalidOperationException("JWT:PrivateKeyPath is not configured.");
        }

        if (!File.Exists(privateKeyPath))
        {
            throw new FileNotFoundException("Private key file not found.", privateKeyPath);
        }
        
        var privateKey = File.ReadAllText(privateKeyPath);

        var rsa = RSA.Create();
        rsa.ImportFromPem(privateKey);

        _keyId = Guid.NewGuid().ToString();
        Key = new RsaSecurityKey(rsa) { KeyId = _keyId };
    }

    public JsonWebKeySet GetJsonWebKeySet()
    {
        var parameters = Key.Rsa.ExportParameters(false);
        var key = new JsonWebKey
        {
            Kid = _keyId,
            Kty = "RSA",
            Use = "sig",
            Alg = SecurityAlgorithms.RsaSha256,
            N = Base64UrlEncoder.Encode(parameters.Modulus),
            E = Base64UrlEncoder.Encode(parameters.Exponent)
        };

        var jwks = new JsonWebKeySet();
        jwks.Keys.Add(key);
        return jwks;
    }

    public async Task<string> GenerateSsoToken(Guid userId, string audience)
    {
        using var scope = _serviceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<TenantUser>>();
        var tenantInfoAccessor = scope.ServiceProvider.GetRequiredService<IMultiTenantContextAccessor<AppTenantInfo>>();

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            throw new Exception("User not found for SSO token generation.");
        }

        var tenantInfo = tenantInfoAccessor.MultiTenantContext?.TenantInfo;
        if (tenantInfo == null)
        {
            throw new Exception("Tenant information not found for SSO token generation.");
        }

        var claims = new List<Claim>
        {
            new("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", user.Id.ToString()),
            new("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name", user.UserName ?? string.Empty),
            new("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress", user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/system", tenantInfo.Id.ToString()),
            new("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/uri", tenantInfo.Domain ?? string.Empty),
        };

        var userRoles = await userManager.GetRolesAsync(user);
        foreach (var userRole in userRoles)
        {
            claims.Add(new Claim("http://schemas.microsoft.com/ws/2008/06/identity/claims/role", userRole));
        }

        var creds = new SigningCredentials(Key, SecurityAlgorithms.RsaSha256);
        
        var expires = DateTime.UtcNow.AddMinutes(5);

        var token = new JwtSecurityToken(
            issuer: _configuration["JWT:ValidIssuer"],
            audience: audience,
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<(string token, DateTime expiration, Guid jti)> GenerateAppToken(TenantUser user)
    {
        using var scope = _serviceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<TenantUser>>();
        var tenantInfoAccessor = scope.ServiceProvider.GetRequiredService<IMultiTenantContextAccessor<AppTenantInfo>>();

        var tenantInfo = tenantInfoAccessor.MultiTenantContext?.TenantInfo;
        if (tenantInfo == null)
        {
            throw new Exception("Tenant information not found for token generation.");
        }

        var jti = Guid.NewGuid();
        var authClaims = new List<Claim>
        {
            new(ClaimTypes.Uri, tenantInfo.Domain ?? string.Empty),
            new("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/system", tenantInfo.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.UserName ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, jti.ToString()),
        };

        var userRoles = await userManager.GetRolesAsync(user);
        foreach (var role in userRoles)
        {
            authClaims.Add(new Claim(ClaimTypes.Role, role));
        }

        var tokenLifetimeMinutes = _configuration.GetValue<int>("JWT:TokenLifetimeMinutes");
        if (tokenLifetimeMinutes <= 0) tokenLifetimeMinutes = 480; // fallback 8h
        var expires = DateTime.UtcNow.AddMinutes(tokenLifetimeMinutes);

        var token = new JwtSecurityToken(
            issuer: _configuration["JWT:ValidIssuer"],
            audience: _configuration["JWT:ValidAudience"],
            expires: expires,
            claims: authClaims,
            signingCredentials: new SigningCredentials(Key, SecurityAlgorithms.RsaSha256)
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), token.ValidTo, jti);
    }
}