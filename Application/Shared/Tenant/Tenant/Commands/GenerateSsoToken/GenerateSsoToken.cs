using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Tenant.Commands.GenerateSsoToken;

public record GenerateSsoTokenCommand : IRequest<Result<GenerateSsoTokenResponse>>
{
    public Guid TenantUsersLinkedToId { get; set; }
}

public class GenerateSsoTokenResponse
{
    public string SsoToken { get; set; } = null!;
    public string TargetDomain { get; set; } = null!;
}

public class GenerateSsoTokenCommandValidator : AbstractValidator<GenerateSsoTokenCommand>
{
    public GenerateSsoTokenCommandValidator(
        ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.TenantUsersLinkedToId).NotEmpty()
            .MustAsync(async (id, cancellationToken) =>
            {
                var link = await context.GetSet<TenantUsersLinkedTo>()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
                return link != null;
            }).WithErrorCode("SsoLink.NotFound").WithMessage("SSO link not found.")
            .MustAsync(async (id, cancellationToken) =>
            {
                var link = await context.GetSet<TenantUsersLinkedTo>()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
                return link != null && link.SourceUserId == user.IdGuid;
            }).WithErrorCode("SsoLink.NotAuthorized")
            .WithMessage("You are not authorized to generate a token for this SSO link.");
    }
}

public class GenerateSsoTokenCommandHandler : IRequestHandler<GenerateSsoTokenCommand, Result<GenerateSsoTokenResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IConfiguration _configuration;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _tenantInfoAccessor;

    public GenerateSsoTokenCommandHandler(
        ITenantDbContext context,
        IUser user,
        IConfiguration configuration,
        IMultiTenantContextAccessor<AppTenantInfo> tenantInfoAccessor)
    {
        _context = context;
        _user = user;
        _configuration = configuration;
        _tenantInfoAccessor = tenantInfoAccessor;
    }


    public async Task<Result<GenerateSsoTokenResponse>> Handle(GenerateSsoTokenCommand request,
        CancellationToken cancellationToken)
    {
        var link = await _context.GetSet<TenantUsersLinkedTo>()
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == request.TenantUsersLinkedToId,
                cancellationToken);

        if (link == null || !link.IsActive)
        {
            return Result<GenerateSsoTokenResponse>.Failure("SsoLink.NotFound",
                "Active SSO link to the target tenant not found.");
        }

        var tenantInfo = _tenantInfoAccessor.MultiTenantContext?.TenantInfo;
        if (tenantInfo == null)
        {
            return Result<GenerateSsoTokenResponse>.Failure("Tenant.NotFound",
                "Could not determine source tenant information.");
        }

        var claims = new List<Claim>
        {
            new("source_user_id", link.SourceUserId.ToString()),
            new("source_tenant_id", tenantInfo.Id.ToString()),
            new("target_user_id", link.TargetUserId.ToString()),
            new("target_tenant_id", link.TargetTenantId.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(link.LinkTokenHash))
        {
            KeyId = link.Id.ToString()
        };
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddSeconds(60); // Short-lived token

        var token = new JwtSecurityToken(
            issuer: _configuration["JWT:ValidIssuer"],
            audience: link.TargetDomain,
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        var tokenHandler = new JwtSecurityTokenHandler();
        return Result<GenerateSsoTokenResponse>.Success(new GenerateSsoTokenResponse
        {
            SsoToken = tokenHandler.WriteToken(token), TargetDomain = link.TargetDomain
        });
    }
}
