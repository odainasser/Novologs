using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.User.Commands.ResetPassword;

public record ResetPasswordCommand : IRequest<Result<ResetPasswordResponse>>
{
    public Guid UserId { get; set; }
    public string Code { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class ResetPasswordResponse
{
}

public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.UserId)
            .NotEmpty()
            .MustAsync(async (userId, cancellationToken) =>
            {
                return await context.GetSet<TenantUser>()
                    .AsNoTracking()
                    .AnyAsync(x => x.Id == userId, cancellationToken);
            }).WithMessage("User not found");

        RuleFor(v => v.Code)
            .NotEmpty();
        RuleFor(v => v.Password)
            .NotEmpty();
    }
}

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result<ResetPasswordResponse>>
{
    private readonly UserManager<TenantUser> _userManager;

    public ResetPasswordCommandHandler(UserManager<TenantUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<ResetPasswordResponse>> Handle(ResetPasswordCommand request,
        CancellationToken cancellationToken)
    {
        // Let UserManager find and track the user to avoid tracking conflicts
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null)
        {
            return Result<ResetPasswordResponse>.Failure("UserNotFound", "User not found");
        }

        var result = await _userManager.ResetPasswordAsync(user, request.Code, request.Password);
        if (!result.Succeeded)
        {
            var identityErrors = result.Errors
                .Select(e => new ErrorItem(e.Code, e.Description))
                .ToList();
            return Result<ResetPasswordResponse>.Failure(identityErrors);
        }

        return Result<ResetPasswordResponse>.Success(new ResetPasswordResponse());
    }
}
