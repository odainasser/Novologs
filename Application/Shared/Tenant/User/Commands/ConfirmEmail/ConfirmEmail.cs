using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.User.Commands.ConfirmEmail;

public record ConfirmEmailCommand : IRequest<Result<ConfirmEmailResponse>>
{
    public string Code { get; set; } = null!;
    public string UserId { get; set; } = null!;
}

public class ConfirmEmailResponse
{
    
}

public class ConfirmEmailCommandValidator : AbstractValidator<ConfirmEmailCommand>
{
    public ConfirmEmailCommandValidator(
        ITenantDbContext context
        )
    {
        RuleFor(v => v.UserId)
            .NotEmpty()
            .MustAsync(async (userId, cancellationToken) =>
            {
                return await context.GetSet<TenantUser>()
                    .AnyAsync(x => x.Id == Guid.Parse(userId), cancellationToken);
            }).WithMessage("User not found");

        RuleFor(v => v.Code)
            .NotEmpty();
    }
}

public class ConfirmEmailCommandHandler : IRequestHandler<ConfirmEmailCommand, Result<ConfirmEmailResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IMapper _mapper;

    public ConfirmEmailCommandHandler( 
        ITenantDbContext context,
        UserManager<TenantUser> userManager,
        IMapper mapper
        )
    {
        _context = context;
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<Result<ConfirmEmailResponse>> Handle(ConfirmEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.GetSet<TenantUser>().FirstOrDefaultAsync(x => x.Id == Guid.Parse(request.UserId),
            cancellationToken: cancellationToken);
        if (user == null)
        {
            return Result<ConfirmEmailResponse>.Failure("UserNotFound", "User not found");
        }

        var result = await _userManager.ConfirmEmailAsync(user, request.Code);
        if (!result.Succeeded)
        {
            return Result<ConfirmEmailResponse>.Failure("InvalidToken", "Invalid token");
        }

        user.EmailConfirmed = true;
        _context.GetSet<TenantUser>().Update(user);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<ConfirmEmailResponse>.Success(new ConfirmEmailResponse());
    }
}
