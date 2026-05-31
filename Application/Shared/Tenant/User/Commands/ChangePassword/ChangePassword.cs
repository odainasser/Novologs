using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.User.Commands.ChangePassword;

public record ChangePasswordCommand : IRequest<Result<ChangePasswordResponse>>
{
    public string Email { get; set; } = null!;
    public string CurrentPassword { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}

public class ChangePasswordResponse
{
}

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Email)
            .NotEmpty().WithMessage("Email is required.")
            .MaximumLength(500).WithMessage("Email must not exceed 500 characters.")
            .EmailAddress().WithMessage("Email is not valid.");

        RuleFor(v => v.CurrentPassword)
            .NotEmpty().WithMessage("Current password is required.");

        RuleFor(v => v.NewPassword)
            .NotEmpty().WithMessage("New password is required.")
            .MinimumLength(6).WithMessage("New password must be at least 6 characters long.")
            .Matches("[A-Z]").WithMessage("New password must contain at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("New password must contain at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("New password must contain at least one digit.")
            .Matches("[^a-zA-Z0-9]").WithMessage("New password must contain at least one special character.");
    }
}

public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result<ChangePasswordResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly UserManager<TenantUser> _userManager;

    public ChangePasswordCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        UserManager<TenantUser> userManager
    )
    {
        _context = context;
        _mapper = mapper;
        _userManager = userManager;
    }

    public async Task<Result<ChangePasswordResponse>> Handle(ChangePasswordCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Result<ChangePasswordResponse>.Failure("User_003", "User not found.");
        }

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            return Result<ChangePasswordResponse>.Failure("ChangePassword_001",
                result.Errors.Select(e => e.Description).FirstOrDefault() ?? "Failed to change password.");
        }

        return Result<ChangePasswordResponse>.Success(new ChangePasswordResponse());
    }
}
