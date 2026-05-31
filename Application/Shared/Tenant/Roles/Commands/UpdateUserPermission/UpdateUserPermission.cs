using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Commands.UpdateUserPermission;

public record UpdateUserPermissionCommand : IRequest<Result<UpdateUserPermissionResponse>>
{
    public Guid UserId { get; set; }
    public List<Guid> PermissionIds { get; set; } = new();
}

public class UpdateUserPermissionResponse
{
}

public class UpdateUserPermissionCommandValidator : AbstractValidator<UpdateUserPermissionCommand>
{
    public UpdateUserPermissionCommandValidator(
        ITenantDbContext context,
        IUser user)
    {
        RuleFor(v => v.UserId)
            .NotEmpty().WithErrorCode("User.Id.Empty").WithMessage("User id is required.")
            .MustAsync(async (id, cancellationToken) =>
                await context.GetSet<TenantUser>().AnyAsync(u => u.Id == id, cancellationToken))
            .WithErrorCode("User.NotFound").WithMessage("The specified user not exists.");

        RuleFor(v => v.PermissionIds)
            .NotEmpty().WithErrorCode("Permission.Id.Empty").WithMessage("At least one permission id is required.")
            .MustAsync(async (ids, cancellationToken) =>
            {
                var existingPermissionCount = await context.GetSet<Permission>()
                    .CountAsync(p => ids.Contains(p.Id), cancellationToken);
                return existingPermissionCount == ids.Count;
            })
            .WithErrorCode("Permission.NotFound").WithMessage("One or more specified permissions do not exist.");

        RuleFor(v => v.PermissionIds)
            .Must(ids => ids.Distinct().Count() == ids.Count)
            .WithErrorCode("Permission.Duplicated").WithMessage("Duplicate permissions are not allowed.");
    }
}

public class
    UpdateUserPermissionCommandHandler : IRequestHandler<UpdateUserPermissionCommand,
    Result<UpdateUserPermissionResponse>>
{
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly ITenantDbContext _context;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly UserManager<TenantUser> _userManager;

    public UpdateUserPermissionCommandHandler(
        ITenantDbContext context,
        IUser user,
        IMapper mapper,
        RoleManager<IdentityRole<Guid>> roleManager,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
        _roleManager = roleManager;
        _userManager = userManager;
    }

    public async Task<Result<UpdateUserPermissionResponse>> Handle(UpdateUserPermissionCommand request,
        CancellationToken cancellationToken)
    {
        var existingUserPermissions = await _context.GetSet<UserPermission>()
            .Where(up => up.UserId == request.UserId)
            .ToListAsync(cancellationToken);

        var permissionsToRemove = existingUserPermissions
            .Where(up => !request.PermissionIds.Contains(up.PermissionId))
            .ToList();

        var currentUserPermissionIds = existingUserPermissions.Select(up => up.PermissionId).ToList();
        var permissionsToAdd = request.PermissionIds
            .Where(newPermissionId => !currentUserPermissionIds.Contains(newPermissionId))
            .Select(newPermissionId => new UserPermission(Guid.NewGuid())
            {
                UserId = request.UserId, PermissionId = newPermissionId
            })
            .ToList();

        _context.GetSet<UserPermission>().RemoveRange(permissionsToRemove);
        _context.GetSet<UserPermission>().AddRange(permissionsToAdd);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateUserPermissionResponse>.Success(new UpdateUserPermissionResponse());
    }
}
