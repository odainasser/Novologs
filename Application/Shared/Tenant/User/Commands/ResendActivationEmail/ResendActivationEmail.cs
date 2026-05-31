using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.User.Commands.ResendActivationEmail;

public record ResendActivationEmailCommand : IRequest<Result<ResendActivationEmailResponse>>
{
    public Guid UserId { get; set; }
}

public class ResendActivationEmailResponse
{
}

public class ResendActivationEmailCommandHandler
    : IRequestHandler<ResendActivationEmailCommand, Result<ResendActivationEmailResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly UserManager<TenantUser> _userManager;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;
    private readonly IMemoryCache _memoryCache;

    public ResendActivationEmailCommandHandler(
        ITenantDbContext context,
        UserManager<TenantUser> userManager,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor,
        IMemoryCache memoryCache)
    {
        _context = context;
        _userManager = userManager;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
        _memoryCache = memoryCache;
    }

    public async Task<Result<ResendActivationEmailResponse>> Handle(
        ResendActivationEmailCommand request,
        CancellationToken cancellationToken)
    {
        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;

        var cacheKey = $"ResendActivation_{tenantInfo?.Id}_{request.UserId}";
        if (_memoryCache.TryGetValue(cacheKey, out _))
        {
            return Result<ResendActivationEmailResponse>.Failure(
                "ResendActivation_001",
                "Activation email was already sent recently. Please wait before requesting again.");
        }

        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null)
        {
            return Result<ResendActivationEmailResponse>.Failure("User_002", "User not found.");
        }

        if (user.EmailConfirmed)
        {
            return Result<ResendActivationEmailResponse>.Failure(
                "ResendActivation_002",
                "User email is already confirmed.");
        }

        var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        code = System.Net.WebUtility.UrlEncode(code);
        var actionLink = $"http://{tenantInfo?.Domain}/auth/confirm-email?Code={code}&userId={user.Id}";

        _sendEmailAndNotificationService.SendEmail(new EmailData()
        {
            TenantId = tenantInfo?.Id,
            EmailTemplate = EmailTemplate.CompanyConfirmEmail,
            UserInfo = new List<EmailUserInfo>()
                { new() { Email = user.Email!, FirstName = user.FullName, Id = user.Id } },
            Subject = "Confirm your email",
            ActionLink = actionLink
        });

        _memoryCache.Set(cacheKey, true, TimeSpan.FromMinutes(10));

        return Result<ResendActivationEmailResponse>.Success(new ResendActivationEmailResponse());
    }
}
