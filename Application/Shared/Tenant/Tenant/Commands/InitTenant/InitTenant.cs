using Finbuckle.MultiTenant.Abstractions;
using Microsoft.Extensions.Configuration;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Strings;
using SystemLoaders.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Services;

namespace Novologs.Application.Tenant.Commands.InitTenant;

public record InitTenantCommand : IRequest<InitTenantResponse>
{
    public Guid ManagementToken { get; set; }
    public string? Email { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? FullName { get; set; }
    public string? Country { get; set; }
    public string? PhoneNumber { get; set; }
}

public class InitTenantCommandValidator : AbstractValidator<InitTenantCommand>
{
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _tenantInfoAccessor;

    public InitTenantCommandValidator(
        IMultiTenantContextAccessor<AppTenantInfo> tenantInfoAccessor)
    {
        _tenantInfoAccessor = tenantInfoAccessor;
        RuleFor(v => v.Email)
            .NotEmpty().WithErrorCode(ErrorCodes.Validation.General).WithMessage("Email is required.")
            .MaximumLength(500).WithErrorCode(ErrorCodes.Validation.General)
            .WithMessage("Email must not exceed 500 characters.");
        RuleFor(v => v.Username)
            .NotEmpty().WithErrorCode(ErrorCodes.Validation.General).WithMessage("Name is required.")
            .MaximumLength(200).WithErrorCode(ErrorCodes.Validation.General)
            .WithMessage("Name must not exceed 200 characters.");
        RuleFor(v => v.Password)
            .NotEmpty().WithErrorCode(ErrorCodes.Validation.General).WithMessage("Password is required.")
            .MaximumLength(200).WithErrorCode(ErrorCodes.Validation.General)
            .WithMessage("Password must not exceed 200 characters.");

        RuleFor(v => v.ManagementToken)
            .NotEmpty().WithErrorCode(ErrorCodes.Validation.General).WithMessage("managementToken name is required.")
            .Must(BeValidMngTokenName).WithErrorCode(ErrorCodes.Validation.General)
            .WithMessage("managementToken is invalid.");
    }

    private bool BeValidMngTokenName(Guid managementToken)
    {
        var currentTenantInfo = _tenantInfoAccessor?.MultiTenantContext?.TenantInfo;
        if (currentTenantInfo != null)
        {
            return currentTenantInfo.ManagementToken == managementToken;
        }

        return false;
    }
}

public class InitTenantResponse
{
}

public class InitTenantCommandHandler : IRequestHandler<InitTenantCommand, InitTenantResponse>
{
    private readonly ITenantDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;
    private readonly IConfiguration _configuration;

    public InitTenantCommandHandler(
        ITenantDbContext context,
        ITenantService tenantService,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor,
        IConfiguration configuration)
    {
        _context = context;
        _tenantService = tenantService;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
        _configuration = configuration;
    }

    public async Task<InitTenantResponse> Handle(InitTenantCommand request, CancellationToken cancellationToken)
    {
        await _tenantService.InitTenant(request.Email!, request.Username!, request.Password!, request.FullName, request.Country, request.PhoneNumber);

        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        var publicDomain = _configuration["PUBLIC_DOMAIN"] ?? "Novotak";
        var emailData = new SystemLoaders.Services.EmailData()
        {
            TenantId = tenantInfo?.Id,
            EmailTemplate = EmailTemplate.None,
            Subject = $"Welcome to {publicDomain} ({tenantInfo!.Name})!",
            UserInfo = new List<SystemLoaders.Services.EmailUserInfo>()
            {
                new SystemLoaders.Services.EmailUserInfo() { Email = request.Email!, FirstName = request.FullName, }
            },
            ActionLink = $"https://{tenantInfo.Domain!}/",
            Message = $"Your account has been successfully created. <br/>" +
                      $"You can now log in using your credentials.<br/>" +
                      $" Company name: {tenantInfo.Name}<br/>" +
                      $" username: {request.Email}<br/>"
        };
        _sendEmailAndNotificationService.SendEmail(emailData);

        return new InitTenantResponse();
    }
}
