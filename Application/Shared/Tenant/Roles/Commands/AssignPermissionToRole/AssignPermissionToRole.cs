using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Roles.Commands.AssignPermissionToUser;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Commands.AssignPermissionToRole;

public record AssignPermissionToRoleCommand : IRequest<Result<AssignPermissionToRoleResponse>>
{
    public Guid RoleId { get; set; }
    public List<Guid> PermissionIds { get; set; } = new();
}

public class AssignPermissionToRoleResponse
{
}

public class AssignPermissionToRoleCommandValidator : AbstractValidator<AssignPermissionToRoleCommand>
{
    public AssignPermissionToRoleCommandValidator(
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

public class
    AssignPermissionToRoleCommandHandler : IRequestHandler<AssignPermissionToRoleCommand,
    Result<AssignPermissionToRoleResponse>>
{
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly ITenantDbContext _context;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly UserManager<TenantUser> _userManager;

    public AssignPermissionToRoleCommandHandler(
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

    public async Task<Result<AssignPermissionToRoleResponse>> Handle(AssignPermissionToRoleCommand request,
        CancellationToken cancellationToken)
    { 
        var existingRolePermissions = await _context.GetSet<RolePermission>()
            .Where(rp => rp.RoleId == request.RoleId)
            .ToListAsync(cancellationToken);

        _context.GetSet<RolePermission>().RemoveRange(existingRolePermissions);

        foreach (var permissionId in request.PermissionIds)
        {
            var rolePermission = new RolePermission(Guid.NewGuid())
            {
                RoleId = request.RoleId,
                PermissionId = permissionId
            };
            _context.GetSet<RolePermission>().Add(rolePermission);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<AssignPermissionToRoleResponse>.Success(new AssignPermissionToRoleResponse());
    }
}
