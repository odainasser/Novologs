using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Services;

namespace Novologs.Application.Tenant.Commands.SsoLogin;

public record SsoLoginCommand : IRequest<Result<SsoLoginResponse>>
{
    public string SsoToken { get; set; } = null!;
}

public class SsoLoginResponse
{
    public string Token { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public DateTime Expiration { get; set; }
    public DateTime RefreshTokenExpiration { get; set; }
}

public class SsoLoginCommandValidator : AbstractValidator<SsoLoginCommand>
{
    public SsoLoginCommandValidator()
    {
        RuleFor(v => v.SsoToken).NotEmpty();
    }
}

public class SsoLoginCommandHandler : IRequestHandler<SsoLoginCommand, Result<SsoLoginResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IJwkService _jwkService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _tenantInfoAccessor;

    public SsoLoginCommandHandler(
        ITenantDbContext context,
        IConfiguration configuration, 
        UserManager<TenantUser> userManager, 
        IJwkService jwkService,
        IMultiTenantContextAccessor<AppTenantInfo> tenantInfoAccessor)
    {
        _context = context;
        _configuration = configuration;
        _userManager = userManager;
        _jwkService = jwkService;
        _tenantInfoAccessor = tenantInfoAccessor;
    }

    public async Task<Result<SsoLoginResponse>> Handle(SsoLoginCommand request, CancellationToken cancellationToken)
    {
        //get current tenent 
        var currentTenantInfo = _tenantInfoAccessor.MultiTenantContext?.TenantInfo;
        if (currentTenantInfo == null)
        {
            return Result<SsoLoginResponse>.Failure("SsoLogin.TenantNotFound", "Current tenant information not found.");
        } 

        var handler = new JwtSecurityTokenHandler();
        var unvalidatedToken = handler.ReadJwtToken(request.SsoToken);

        var sourceTenantIdClaim = unvalidatedToken.Claims.FirstOrDefault(c => c.Type == "source_tenant_id");
        if (sourceTenantIdClaim == null || !Guid.TryParse(sourceTenantIdClaim.Value, out var sourceTenantId))
        {
            return Result<SsoLoginResponse>.Failure("SsoLogin.InvalidToken", "Invalid SSO token.");
        }

        var link = await _context.GetSet<TenantUsersLinkedFrom>()
            .FirstOrDefaultAsync(l => l.SourceTenantId == sourceTenantId, cancellationToken);

        if (link == null)
        {
            return Result<SsoLoginResponse>.Failure("SsoLogin.NoLink", "No SSO link found from the source tenant.");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(link.LinkTokenHash));

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = unvalidatedToken.Issuer,
            ValidateAudience = true, 
            ValidAudience = currentTenantInfo.Domain,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateLifetime = true,
        };

        ClaimsPrincipal principal;
        try
        {
            principal = handler.ValidateToken(request.SsoToken, validationParameters, out _);
        }
        catch (Exception ex)
        {
            return Result<SsoLoginResponse>.Failure("SsoLogin.TokenValidationFailed", $"SSO token validation failed: {ex.Message}");
        }

        var targetUserIdClaim = principal.Claims.FirstOrDefault(c => c.Type == "target_user_id");
        if (targetUserIdClaim == null || !Guid.TryParse(targetUserIdClaim.Value, out var targetUserId))
        {
            return Result<SsoLoginResponse>.Failure("SsoLogin.InvalidClaim", "Invalid target user ID in SSO token.");
        }

        var user = await _userManager.FindByIdAsync(targetUserId.ToString());
        if (user == null || !user.IsActive)
        {
            return Result<SsoLoginResponse>.Failure("SsoLogin.UserNotFound", "User not found or is inactive.");
        }

        var (token, expiration, jti) = await _jwkService.GenerateAppToken(user);
        var refreshToken = Guid.NewGuid().ToString();
        var refreshTokenLifetimeMinutes = _configuration.GetValue<int>("JWT:RefreshTokenTokenLifetimeMinutes");

        var userLoginInfo = new Domain.Entities.UserLoginInfo()
        {
            UserId = user.Id,
            AcceessTokenJti = jti,
            LastLogin = DateTime.UtcNow,
            ValidTill = expiration.ToUniversalTime(),
            RefreshToken = refreshToken,
            RefreshTokenValidTill = DateTime.UtcNow.AddMinutes(refreshTokenLifetimeMinutes).ToUniversalTime()
        };

        await _context.GetSet<Domain.Entities.UserLoginInfo>().AddAsync(userLoginInfo, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<SsoLoginResponse>.Success(new SsoLoginResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            Expiration = expiration,
            RefreshTokenExpiration = userLoginInfo.RefreshTokenValidTill
        });
    }
}
