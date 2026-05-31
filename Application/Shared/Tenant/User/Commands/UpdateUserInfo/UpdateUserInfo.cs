using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.User.Commands.UpdateUserInfo;

public record UpdateUserInfoCommand : IRequest<Result<UpdateUserInfoResponse>>
{    public string FullName { get; set; } = null!;
    public string Country { get; set; } = null!;
}

public class UpdateUserInfoResponse
{
}

public class UpdateUserInfoCommandValidator : AbstractValidator<UpdateUserInfoCommand>
{
    public UpdateUserInfoCommandValidator(IUser user)
    {
        RuleFor(v => v.FullName)
            .MaximumLength(200)
            .NotEmpty();

        RuleFor(v => v.Country)
            .MaximumLength(200)
            .NotEmpty();
    }
}

public class UpdateUserInfoCommandHandler : IRequestHandler<UpdateUserInfoCommand, Result<UpdateUserInfoResponse>>
{  
    private readonly ITenantDbContext _context;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IUser _user;


    public UpdateUserInfoCommandHandler(
        ITenantDbContext context,
        UserManager<TenantUser> userManager,
        IUser user
        )
    { 
        _context = context;
        _userManager = userManager;
        _user = user;
    }

    public async Task<Result<UpdateUserInfoResponse>> Handle(UpdateUserInfoCommand request, CancellationToken cancellationToken)
    {
        if (_user.IdGuid is null) return Result<UpdateUserInfoResponse>.Failure("UserNotFound", "User not found");

        var user = await _userManager.FindByIdAsync(_user.Id!);
        if (user is null) return Result<UpdateUserInfoResponse>.Failure("UserNotFound", "User not found");

        user.FullName = request.FullName;
        user.Country = request.Country;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return Result<UpdateUserInfoResponse>.Failure("UpdateUserError",
                result.Errors.Select(e => e.Description).FirstOrDefault() ?? "Failed to update user info.");
        }

        return Result<UpdateUserInfoResponse>.Success(new UpdateUserInfoResponse());
    }
}
