using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Commands.UnassignPermissionToRole;

public record UnassignPermissionToRoleCommand : IRequest<Result<UnassignPermissionToRoleResponse>>
{
    public Guid RoleId { get; set; }
    public List<Guid> PermissionIds { get; set; } = new();
}

public class UnassignPermissionToRoleResponse
{
}

public class UnassignPermissionToRoleCommandValidator : AbstractValidator<UnassignPermissionToRoleCommand>
{
    public UnassignPermissionToRoleCommandValidator(
        ITenantDbContext context,
        IUser user
    )
    {
        RuleFor(v => v.RoleId)
            .NotEmpty().WithErrorCode("Role.Id.Empty").WithMessage("Role id is required.")
            .MustAsync(async (id, cancellationToken) =>
                await context.GetSet<IdentityRole<Guid>>().AnyAsync(r => r.Id == id, cancellationToken))
            .WithErrorCode("Role.NotFound").WithMessage("The specified role not exists.");

        RuleFor(v => v.PermissionIds)
            .NotEmpty().WithErrorCode("Permission.Id.Empty").WithMessage("At least one permission id is required.")
            .MustAsync(async (ids, cancellationToken) =>
            {
                var existingPermissionCount = await context.GetSet<Permission>()
                    .CountAsync(p => ids.Contains(p.Id), cancellationToken);
                return existingPermissionCount == ids.Count;
            })
            .WithErrorCode("Permission.NotFound").WithMessage("One or more specified permissions do not exist.");
    }
}

public class UnassignPermissionToRoleCommandHandler : IRequestHandler<UnassignPermissionToRoleCommand,
    Result<UnassignPermissionToRoleResponse>>
{
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly ITenantDbContext _context;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly UserManager<TenantUser> _userManager;

    public UnassignPermissionToRoleCommandHandler(
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

    public async Task<Result<UnassignPermissionToRoleResponse>> Handle(UnassignPermissionToRoleCommand request,
        CancellationToken cancellationToken)
    {
        var rolePermissionsToRemove = await _context.GetSet<RolePermission>()
            .Where(rp => rp.RoleId == request.RoleId && request.PermissionIds.Contains(rp.PermissionId))
            .ToListAsync(cancellationToken);

        _context.GetSet<RolePermission>().RemoveRange(rolePermissionsToRemove);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<UnassignPermissionToRoleResponse>.Success(new UnassignPermissionToRoleResponse());
    }
}
