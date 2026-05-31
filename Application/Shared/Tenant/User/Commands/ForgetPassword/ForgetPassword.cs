using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Identity;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.User.Commands.ForgetPassword;

public record ForgetPasswordCommand : IRequest<Result<ForgetPasswordResponse>>
{
    public string UsernameOrEmail { get; set; } = null!;
}

public class ForgetPasswordResponse
{
}

public class ForgetPasswordCommandValidator : AbstractValidator<ForgetPasswordCommand>
{
    public ForgetPasswordCommandValidator()
    {
    }
}

public class ForgetPasswordCommandHandler : IRequestHandler<ForgetPasswordCommand, Result<ForgetPasswordResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IMapper _mapper;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public ForgetPasswordCommandHandler(
        ITenantDbContext context,
        UserManager<TenantUser> userManager,
        IMapper mapper,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor)
    {
        _context = context;
        _userManager = userManager;
        _mapper = mapper;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<ForgetPasswordResponse>> Handle(ForgetPasswordCommand request,
        CancellationToken cancellationToken)
    {
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
            return Result<ForgetPasswordResponse>.Success(new ForgetPasswordResponse());
        }

        var code = await _userManager.GeneratePasswordResetTokenAsync(user);
        code = System.Net.WebUtility.UrlEncode(code);
        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        var ActionLink = $"http://{tenantInfo?.Domain}/auth/reset-password?Code={code}&userId={user.Id}";
        _sendEmailAndNotificationService.SendEmail(new EmailData()
        {
            TenantId = tenantInfo?.Id,
            EmailTemplate = EmailTemplate.CompanyResetPasswordEmail,
            UserInfo =
                new List<EmailUserInfo>() { new() { Email = user.Email!, FirstName = user.FullName, Id = user.Id } },
            Subject = "Reset your password",
            ActionLink = ActionLink
        });

        return Result<ForgetPasswordResponse>.Success(new ForgetPasswordResponse());
    }
}
