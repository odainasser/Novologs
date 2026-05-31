using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.User.Commands.GetRolesUser;

public record GetRolesUserCommand : IRequest<Result<GetRolesUserResponse>>
{
}

public class GetRolesUserCommandValidator : AbstractValidator<GetRolesUserCommand>
{
    public GetRolesUserCommandValidator()
    {
    }
}

public class GetRolesUserResponse
{
    public List<string> Roles { get; set; } = new List<string>();
    public List<string> Permissions { get; set; } = new List<string>();
}

public class GetRolesUserCommandHandler : IRequestHandler<GetRolesUserCommand, Result<GetRolesUserResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly UserManager<TenantUser> _userManager;

    public GetRolesUserCommandHandler(
        ITenantDbContext context,
        UserManager<TenantUser> userManager,
        IHttpContextAccessor httpContextAccessor
    )
    {
        _context = context;
        _userManager = userManager;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<GetRolesUserResponse>> Handle(GetRolesUserCommand request,
        CancellationToken cancellationToken)
    {
        var tenantUser = await _userManager.GetUserAsync(_httpContextAccessor?.HttpContext?.User!);
        if (tenantUser == null)
        {
            return Result<GetRolesUserResponse>.Failure(new[] { new ErrorItem("User_004", "User not found") });
        }

        var roles = await _userManager.GetRolesAsync(tenantUser);


        // Get permissions for roles
        var rolePermissions = await _context.GetSet<RolePermission>()
            .Include(rp => rp.Permission)
            .Where(rp => roles.Contains(rp.Role.Name ?? ""))
            .Select(rp => rp.Permission.Name)
            .ToListAsync();

        // Get direct user permissions (optional)
        var userPermissions = await _context.GetSet<UserPermission>()
            .Include(up => up.Permission)
            .Where(up => up.UserId == tenantUser.Id)
            .Select(up => up.Permission.Name)
            .ToListAsync();

        var allPermissions = rolePermissions.Concat(userPermissions).Distinct().ToList();

        var response = new GetRolesUserResponse { Roles = roles.ToList(), Permissions = allPermissions };
        return Result<GetRolesUserResponse>.Success(response);
    }
}
