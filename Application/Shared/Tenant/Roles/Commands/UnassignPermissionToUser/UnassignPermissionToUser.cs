using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Commands.UnassignPermissionToUser;

public record UnassignPermissionToUserCommand : IRequest<Result<UnassignPermissionToUserResponse>>
{
    public List<Guid> UserIds { get; set; } = new();
    public List<Guid> PermissionIds { get; set; } = new();
}

public class UnassignPermissionToUserResponse
{
}

public class UnassignPermissionToUserCommandValidator : AbstractValidator<UnassignPermissionToUserCommand>
{
    public UnassignPermissionToUserCommandValidator(
        ITenantDbContext context,
        IUser user
    )
    {
        RuleFor(v => v.UserIds)
            .NotEmpty().WithErrorCode("User.Id.Empty").WithMessage("At least one user id is required.")
            .MustAsync(async (ids, cancellationToken) =>
            {
                var existingUserCount = await context.GetSet<TenantUser>()
                    .CountAsync(u => ids.Contains(u.Id), cancellationToken);
                return existingUserCount == ids.Count;
            })
            .WithErrorCode("User.NotFound").WithMessage("One or more specified users do not exist.")
            .Must(ids => ids.Distinct().Count() == ids.Count)
            .WithErrorCode("User.Id.Duplicated").WithMessage("User ids cannot be duplicated.")
            ;

        RuleFor(v => v.PermissionIds)
            .NotEmpty().WithErrorCode("Permission.Id.Empty").WithMessage("At least one permission id is required.")
            .MustAsync(async (ids, cancellationToken) =>
            {
                var existingPermissionCount = await context.GetSet<Permission>()
                    .CountAsync(p => ids.Contains(p.Id), cancellationToken);
                return existingPermissionCount == ids.Count;
            })
            .WithErrorCode("Permission.NotFound").WithMessage("One or more specified permissions do not exist.")
            .Must(ids => ids.Distinct().Count() == ids.Count)
            .WithErrorCode("Permission.Id.Duplicated").WithMessage("Permission ids cannot be duplicated.")
            ;
    }
}

public class UnassignPermissionToUserCommandHandler : IRequestHandler<UnassignPermissionToUserCommand,
    Result<UnassignPermissionToUserResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly UserManager<TenantUser> _userManager;

    public UnassignPermissionToUserCommandHandler(
        ITenantDbContext context,
        IUser user,
        IMapper mapper,
        RoleManager<IdentityRole<Guid>> roleManager,
        UserManager<TenantUser> userManager
    )
    {
        _context = context;
        _user = user;
        _mapper = mapper;
        _roleManager = roleManager;
        _userManager = userManager;
    }

    public async Task<Result<UnassignPermissionToUserResponse>> Handle(UnassignPermissionToUserCommand request,
        CancellationToken cancellationToken)
    {
        foreach (var userId in request.UserIds)
        {
            var userPermissionsToRemove = await _context.GetSet<UserPermission>()
                .Where(up => up.UserId == userId && request.PermissionIds.Contains(up.PermissionId))
                .ToListAsync(cancellationToken);

            _context.GetSet<UserPermission>().RemoveRange(userPermissionsToRemove);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<UnassignPermissionToUserResponse>.Success(new UnassignPermissionToUserResponse());
    }
}
