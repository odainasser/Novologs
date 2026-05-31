using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Commands.UpdateRolePermission;

public record UpdateRolePermissionCommand : IRequest<Result<UpdateRolePermissionResponse>>
{
    //add RoleId and list of permissions Ids
    public Guid RoleId { get; set; }
    public List<Guid> PermissionIds { get; set; } = new();
}

public class UpdateRolePermissionResponse
{
}

public class UpdateRolePermissionCommandValidator : AbstractValidator<UpdateRolePermissionCommand>
{
    public UpdateRolePermissionCommandValidator(
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
        
        RuleFor(v => v.PermissionIds)
            .Must(ids => ids.Distinct().Count() == ids.Count)
            .WithErrorCode("Permission.Duplicated").WithMessage("Duplicate permissions are not allowed.");
    }
}

public class
    UpdateRolePermissionCommandHandler : IRequestHandler<UpdateRolePermissionCommand,
    Result<UpdateRolePermissionResponse>>
{
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly ITenantDbContext _context;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly UserManager<TenantUser> _userManager;

    public UpdateRolePermissionCommandHandler(
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

    public async Task<Result<UpdateRolePermissionResponse>> Handle(UpdateRolePermissionCommand request,
        CancellationToken cancellationToken)
    {
        var existingRolePermissions = await _context.GetSet<RolePermission>()
            .Where(rp => rp.RoleId == request.RoleId)
            .ToListAsync(cancellationToken);
 
        var permissionsToRemove = existingRolePermissions
            .Where(rp => !request.PermissionIds.Contains(rp.PermissionId))
            .ToList();

        var currentPermissionIds = existingRolePermissions.Select(rp => rp.PermissionId).ToList();
        var permissionsToAdd = request.PermissionIds
            .Where(newPermissionId => !currentPermissionIds.Contains(newPermissionId))
            .Select(newPermissionId => new RolePermission(Guid.NewGuid())
            {
                RoleId = request.RoleId, PermissionId = newPermissionId
            })
            .ToList();

        _context.GetSet<RolePermission>().RemoveRange(permissionsToRemove);
        _context.GetSet<RolePermission>().AddRange(permissionsToAdd);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateRolePermissionResponse>.Success(new UpdateRolePermissionResponse());
    }
}
