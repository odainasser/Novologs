using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Domain.Enums;
using Novologs.Application.Common.Services;
using Novologs.Infrastructure.Services;

namespace Novologs.Application.User.Commands.Login;

public record LoginCommand : IRequest<Result<LoginResponse>>
{
    public string UsernameOrEmail { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? DeviceTypeData { get; set; }
    public string? FcmDeviceToken { get; set; }
    public DeviceType? DeviceType { get; set; }
}

public class LoginResponse
{
    public string Token { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public DateTime Expiration { get; set; }
    public DateTime RefreshTokenExpiration { get; set; }
}

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.UsernameOrEmail)
            .NotEmpty().WithMessage("Username or Email is required.");

        RuleFor(v => v.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly UserManager<TenantUser> _userManager;
    private readonly SignInManager<TenantUser> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _tenantInfoAccessor;
    private readonly IJwkService _jwkService;
    private readonly ITenantPolicyService _tenantPolicyService;


    public LoginCommandHandler(
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

    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var tenantInfo = _tenantInfoAccessor?.MultiTenantContext?.TenantInfo;
        if (tenantInfo == null)
        {
            return Result<LoginResponse>.Failure("Login_004", "Tenant information not found.");
        }
        
        var policyResult = await _tenantPolicyService.ValidatePolicies();
        if (!policyResult.Succeeded)
        {
            return Result<LoginResponse>.Failure(policyResult.Errors);
        }

        TenantUser? user = null;
        if (request.UsernameOrEmail.Contains('@'))
        {
            user = await _userManager.FindByEmailAsync(request.UsernameOrEmail);
        }
        else
        {
            user = await _userManager.FindByNameAsync(request.UsernameOrEmail);
        }

        if (user == null)
        {
            return Result<LoginResponse>.Failure("Login_003", "Invalid credentials.");
        }
         
        if (user.IsActive == false)
        {
            return Result<LoginResponse>.Failure("Login_005", "User is inactive.");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password,
            lockoutOnFailure: true);

        if (result.IsLockedOut)
        {
            return Result<LoginResponse>.Failure("Login_003", "Account locked out.");
        }

        if (result.RequiresTwoFactor)
        {
            return Result<LoginResponse>.Failure("Login_003",
                "Two-factor authentication is required but not enabled for this API.");
        }

        if (!result.Succeeded)
        {
            return Result<LoginResponse>.Failure("Login_002", "Invalid credentials.");
        }
        
        //check for user count pricing strategy
        var currentUserCountPolicyResult = await _tenantPolicyService.ValidateCurrentUserPolicies(user.Id);
        if (!currentUserCountPolicyResult.Succeeded)
        {
            return Result<LoginResponse>.Failure(currentUserCountPolicyResult.Errors);
        }

        var (token, expiration, jti) = await _jwkService.GenerateAppToken(user);
 
        var refreshTokenTokenLifetimeMinutes = _configuration.GetValue<int>("JWT:RefreshTokenTokenLifetimeMinutes");
        string refreshToken = Guid.NewGuid().ToString();

        var userLoginInfo = new Domain.Entities.UserLoginInfo()
        {
            UserId = user.Id,
            AcceessTokenJti = jti,
            DeviceType = request.DeviceType ?? DeviceType.Unknown,
            DeviceTypeData = request.DeviceTypeData,
            FcmDeviceToken = request.FcmDeviceToken,
            LastLogin = DateTime.UtcNow,
            ValidTill = expiration.ToUniversalTime(),
            RefreshToken = refreshToken,
            RefreshTokenValidTill = DateTime.UtcNow.AddMinutes(refreshTokenTokenLifetimeMinutes).ToUniversalTime()
        };
        if (string.IsNullOrWhiteSpace(request.FcmDeviceToken) == true)
        {
            userLoginInfo.ValidTill = DateTime.Now.AddSeconds(-1).ToUniversalTime();
        }

        await _context.GetSet<Domain.Entities.UserLoginInfo>().AddAsync(userLoginInfo);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<LoginResponse>.Success(new LoginResponse()
        {
            Token = token,
            RefreshToken = refreshToken,
            Expiration = expiration,
            RefreshTokenExpiration = userLoginInfo.RefreshTokenValidTill
        });
    }
}
