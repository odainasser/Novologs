using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.User.Commands.ConfirmEmailSetPassword;

public record ConfirmEmailSetPasswordCommand : IRequest<Result<ConfirmEmailSetPasswordResponse>>
{
    public string Code { get; set; } = null!;
    public Guid UserId { get; set; }
    public string Password { get; set; } = null!;
}

public class ConfirmEmailSetPasswordResponse
{
}

public class ConfirmEmailSetPasswordCommandValidator : AbstractValidator<ConfirmEmailSetPasswordCommand>
{
    public ConfirmEmailSetPasswordCommandValidator(
        ITenantDbContext context)
    {
        RuleFor(v => v.UserId)
            .NotEmpty()
            .MustAsync(async (userId, cancellationToken) =>
            {
                return await context.GetSet<TenantUser>()
                    .AnyAsync(x => x.Id == userId, cancellationToken);
            }).WithMessage("User not found");

        RuleFor(v => v.Code)
            .NotEmpty();
        RuleFor(v => v.Password)
            .NotEmpty();
    }
}

public class ConfirmEmailSetPasswordCommandHandler : IRequestHandler<ConfirmEmailSetPasswordCommand, Result<ConfirmEmailSetPasswordResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IMapper _mapper;

    public ConfirmEmailSetPasswordCommandHandler(
        ITenantDbContext context,
        UserManager<TenantUser> userManager,
        IMapper mapper)
    {
        _context = context;
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<Result<ConfirmEmailSetPasswordResponse>> Handle(ConfirmEmailSetPasswordCommand request,
        CancellationToken cancellationToken)
    {
        // Use FindByIdAsync to let UserManager retrieve the user with proper tracking
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null)
        {
            return Result<ConfirmEmailSetPasswordResponse>.Failure("UserNotFound", "User not found");
        }

        var result = await _userManager.ConfirmEmailAsync(user, request.Code);
        if (!result.Succeeded)
        {
            return Result<ConfirmEmailSetPasswordResponse>.Failure("InvalidToken", "Invalid token");
        }

        await _userManager.RemovePasswordAsync(user);
        var passwordResult = await _userManager.AddPasswordAsync(user, request.Password);
        if (!passwordResult.Succeeded)
        {
            var identityErrors = passwordResult.Errors
                .Select(e => new ErrorItem(e.Code, e.Description))
                .ToList();
            return Result<ConfirmEmailSetPasswordResponse>.Failure(identityErrors);
        }

        // UserManager already handles EmailConfirmed and persistence, no manual update needed
        return Result<ConfirmEmailSetPasswordResponse>.Success(new ConfirmEmailSetPasswordResponse());
    }
}
