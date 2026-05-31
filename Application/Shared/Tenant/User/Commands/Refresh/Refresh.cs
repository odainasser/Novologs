using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Services;
using Novologs.Application.User.Commands.Login;
using Novologs.Infrastructure.Services;
using UserLoginInfo = Novologs.Domain.Entities.UserLoginInfo;

namespace Novologs.Application.User.Commands.Refresh;

public record RefreshCommand : IRequest<Result<RefreshResponse>>
{
    public string RefreshToken { get; set; } = null!;
}

public class RefreshResponse
{
    public string Token { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public DateTime Expiration { get; set; }
    public DateTime RefreshTokenExpiration { get; set; }
}

public class RefreshCommandValidator : AbstractValidator<RefreshCommand>
{
    public RefreshCommandValidator(ITenantDbContext context)
    {
        //todo validate refresh token in db
        RuleFor(v => v.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required.")
            .MustAsync(async (refreshToken, cancellationToken) =>
            {
                return await context.GetSet<UserLoginInfo>()
                    .AnyAsync(u => u.RefreshToken == refreshToken && u.RefreshTokenValidTill > DateTime.UtcNow,
                        cancellationToken);
            }).WithMessage("Refresh token is invalid or expired.");
    }
}

public class RefreshCommandHandler : IRequestHandler<RefreshCommand, Result<RefreshResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly UserManager<TenantUser> _userManager;
    private readonly SignInManager<TenantUser> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _tenantInfoAccessor;
    private readonly IJwkService _jwkService;
    private readonly ITenantPolicyService _tenantPolicyService;

    public RefreshCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        UserManager<TenantUser> userManager,
        SignInManager<TenantUser> signInManager,
        IConfiguration configuration,
        IMultiTenantContextAccessor<AppTenantInfo> tenantInfoAccessor,
        IJwkService jwkService,
        ITenantPolicyService tenantPolicyService
    )
    {
        _context = context;
        _mapper = mapper;
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _tenantInfoAccessor = tenantInfoAccessor;
        _tenantPolicyService = tenantPolicyService;
        _jwkService = jwkService;
    }

    public async Task<Result<RefreshResponse>> Handle(RefreshCommand request, CancellationToken cancellationToken)
    {
        var tenantInfo = _tenantInfoAccessor?.MultiTenantContext?.TenantInfo;
        if (tenantInfo == null)
        {
            return Result<RefreshResponse>.Failure("Refresh_004", "Tenant information not found.");
        }

        var policyResult = await _tenantPolicyService.ValidatePolicies();
        if (!policyResult.Succeeded)
        {
            return Result<RefreshResponse>.Failure(policyResult.Errors);
        }

        var userLoginInfo = await _context.GetSet<UserLoginInfo>()
            .Where(u => u.RefreshToken == request.RefreshToken && u.RefreshTokenValidTill > DateTime.UtcNow)
            .OrderByDescending(u => u.LastLogin)
            .FirstOrDefaultAsync(cancellationToken);

        if (userLoginInfo == null || userLoginInfo.RefreshTokenValidTill <= DateTime.UtcNow)
        {
            return Result<RefreshResponse>.Failure("Refresh_003", "Refresh token expired or invalid.");
        }

        var user = await _userManager.FindByIdAsync(userLoginInfo.UserId.ToString());
        if (user == null)
        {
            return Result<RefreshResponse>.Failure("Refresh_004", "User not found.");
        }

        if (user.IsActive == false)
        {
            return Result<RefreshResponse>.Failure("Refresh_005", "User is inactive.");
        }

        //check for user count pricing strategy
        var currentUserCountPolicyResult = await _tenantPolicyService.ValidateCurrentUserPolicies(user.Id);
        if (!currentUserCountPolicyResult.Succeeded)
        {
            return Result<RefreshResponse>.Failure(currentUserCountPolicyResult.Errors);
        }

        var (token, expiration, jti) = await _jwkService.GenerateAppToken(user);

        userLoginInfo.AcceessTokenJti = jti;
        userLoginInfo.LastLogin = DateTime.UtcNow;
        userLoginInfo.ValidTill = expiration.ToUniversalTime();

        string refreshToken = Guid.NewGuid().ToString();
        userLoginInfo.RefreshToken = refreshToken;
        var refreshTokenTokenLifetimeMinutes = _configuration.GetValue<int>("JWT:RefreshTokenTokenLifetimeMinutes");
        userLoginInfo.RefreshTokenValidTill =
            DateTime.UtcNow.AddMinutes(refreshTokenTokenLifetimeMinutes).ToUniversalTime();

        await _context.SaveChangesAsync(cancellationToken);

        return Result<RefreshResponse>.Success(new RefreshResponse()
        {
            Token = token,
            RefreshToken = refreshToken,
            Expiration = expiration,
            RefreshTokenExpiration = userLoginInfo.RefreshTokenValidTill
        });
    }
}
