using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Tenant.Commands.AcceptSsoLink;

public record AcceptSsoLinkCommand : IRequest<Result<AcceptSsoLinkResponse>>
{
    public string SourceTenantAccessToken { get; set; } = null!;
    public string? UserFullName { get; set; }
    public string? UserEmail { get; set; }
    public string? UserProfilePictureUrl { get; set; }
}

public class AcceptSsoLinkResponse
{
    public string LinkToken { get; set; } = null!;
    public string? UserFullName { get; set; }
    public string? UserEmail { get; set; }
    public string? UserProfilePictureUrl { get; set; }
}

public class AcceptSsoLinkCommandValidator : AbstractValidator<AcceptSsoLinkCommand>
{
    public AcceptSsoLinkCommandValidator()
    {
        RuleFor(x => x.SourceTenantAccessToken).NotEmpty();
    }
}

public class AcceptSsoLinkCommandHandler : IRequestHandler<AcceptSsoLinkCommand, Result<AcceptSsoLinkResponse>>
{
    private readonly IUser _user;
    private readonly ITenantDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public AcceptSsoLinkCommandHandler(ITenantDbContext context, IUser user,
        IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _context = context;
        _user = user;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task<Result<AcceptSsoLinkResponse>> Handle(AcceptSsoLinkCommand request,
        CancellationToken cancellationToken)
    {
        var handler = new JwtSecurityTokenHandler();
        var sourceTokenUnvalidated = handler.ReadJwtToken(request.SourceTenantAccessToken);

        var sourceDomain = sourceTokenUnvalidated.Claims
            .First(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/uri").Value;
        var issuer = sourceTokenUnvalidated.Issuer;

        // Fetch JWKS from source domain 
        var defaultHttpSchema = _configuration["DefaultHttpSchema"];
        if (string.IsNullOrEmpty(defaultHttpSchema))
        {
            defaultHttpSchema = "http://"; // Default to http if not configured
        }

        var client = _httpClientFactory.CreateClient();
        var jwksResponse = await client.GetAsync($"{defaultHttpSchema}{sourceDomain}/tenant/.well-known/jwks.json",
            cancellationToken);
        if (!jwksResponse.IsSuccessStatusCode)
        {
            return Result<AcceptSsoLinkResponse>.Failure("SsoLink.JwksFailed",
                "Could not fetch JWKS from source tenant.");
        }

        var jwksString = await jwksResponse.Content.ReadAsStringAsync(cancellationToken);
        var jwks = new JsonWebKeySet(jwksString);

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = _configuration["JWT:ValidAudience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKeys = jwks.Keys,
            ValidateLifetime = true,
        };

        ClaimsPrincipal principal;
        try
        {
            principal = handler.ValidateToken(request.SourceTenantAccessToken, validationParameters,
                out var validatedToken);
        } 
        catch (Exception ex)
        {
            return Result<AcceptSsoLinkResponse>.Failure("SsoLink.InvalidToken",
                $"Token validation failed: {ex.Message}");
        }

        // Now that the token is validated, we can trust its claims.
        var sourceTenantId = Guid.Parse(principal.Claims
            .First(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/system").Value);
        var sourceUserId = Guid.Parse(principal.Claims
            .First(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier").Value);
        var sourceUserFullName = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
        var sourceUserEmail = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
        var sourceUserProfilePictureUrl = principal.Claims.FirstOrDefault(c => c.Type == "picture")?.Value;
        var sourceTenantName = issuer;

        var targetUserId = _user.IdGuid!.Value;
        var targetUser = await _context.GetSet<TenantUser>().Include(x=>x.ProfileImageFile).FirstOrDefaultAsync(x => x.Id == targetUserId, cancellationToken);

        var existingLink = await _context.GetSet<TenantUsersLinkedFrom>()
            .AnyAsync(
                x => x.TargetUserId == targetUserId && x.SourceTenantId == sourceTenantId &&
                     x.SourceUserId == sourceUserId, cancellationToken);
        if (existingLink)
        {
            return Result<AcceptSsoLinkResponse>.Failure("SsoLink.AlreadyExists", "SSO link already exists.");
        }

        var linkToken = GenerateSecureToken();
        var linkTokenHash = ComputeSha256Hash(linkToken);

        var newLink = new TenantUsersLinkedFrom(Guid.NewGuid())
        {
            SourceTenantId = sourceTenantId,
            SourceDomain = sourceDomain,
            SourceTenantName = sourceTenantName,
            SourceUserId = sourceUserId,
            SourceUserFullName = sourceUserFullName,
            SourceUserEmail = sourceUserEmail,
            SourceUserProfilePictureUrl = sourceUserProfilePictureUrl,
            TargetUserId = targetUserId,
            LinkTokenHash = linkTokenHash,
            IsActive = true
        };

        _context.GetSet<TenantUsersLinkedFrom>().Add(newLink);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AcceptSsoLinkResponse>.Success(new AcceptSsoLinkResponse
        {
            LinkToken = linkToken,
            UserFullName = targetUser?.FullName,
            UserEmail = targetUser?.Email,
            UserProfilePictureUrl = targetUser?.ProfileImageFile?.Url
        });
    }

    private string GenerateSecureToken(int length = 32)
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(length));
    }

    private static string ComputeSha256Hash(string rawData)
    {
        using (SHA256 sha256Hash = SHA256.Create())
        {
            byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));

            var builder = new StringBuilder();
            foreach (var b in bytes)
            {
                builder.Append(b.ToString("x2"));
            }

            return builder.ToString();
        }
    }
}
