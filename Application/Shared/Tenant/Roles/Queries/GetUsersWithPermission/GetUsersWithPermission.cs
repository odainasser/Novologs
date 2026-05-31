using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.User.Dto;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Queries.GetUsersWithPermission;

public record GetUsersWithPermissionQuery : IRequest<Result<GetUsersWithPermissionResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
    public Guid? PermissionId { get; set; }
    public string? PermissionName { get; set; }
}

public class GetUsersWithPermissionResponse : FilteredResult<TenantUserDto>
{
}

public class GetUsersWithPermissionQueryValidator : AbstractValidator<GetUsersWithPermissionQuery>
{
    public GetUsersWithPermissionQueryValidator(ITenantDbContext context)
    {
        When(x => x.PermissionId.HasValue, () =>
        {
            RuleFor(x => x.PermissionId)
                .MustAsync(async (permissionId, cancellationToken) =>
                {
                    var permission = await context.GetSet<Permission>()
                        .FirstOrDefaultAsync(p => p.Id == permissionId, cancellationToken);
                    return permission != null;
                }).WithMessage("Permission not found.");
        });

        When(x => !string.IsNullOrEmpty(x.PermissionName), () =>
        {
            RuleFor(x => x.PermissionName)
                .MustAsync(async (permissionName, cancellationToken) =>
                {
                    var permission = await context.GetSet<Permission>()
                        .FirstOrDefaultAsync(p => p.Name == permissionName, cancellationToken);
                    return permission != null;
                }).WithMessage("Permission not found.");
        });
    }
}

public class
    GetUsersWithPermissionQueryHandler : IRequestHandler<GetUsersWithPermissionQuery,
    Result<GetUsersWithPermissionResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly UserManager<TenantUser> _userManager;

    public GetUsersWithPermissionQueryHandler(
        ITenantDbContext context,
        IUser user,
        IMapper mapper,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
        _userManager = userManager;
    }

    public async Task<Result<GetUsersWithPermissionResponse>> Handle(GetUsersWithPermissionQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetUsersWithPermissionResponse();

        Permission? permission = null;

        if (request.PermissionId.HasValue)
        {
            permission = await _context.GetSet<Permission>()
                .FirstOrDefaultAsync(p => p.Id == request.PermissionId.Value, cancellationToken);
        }
        else if (!string.IsNullOrEmpty(request.PermissionName))
        {
            permission = await _context.GetSet<Permission>()
                .FirstOrDefaultAsync(p => p.Name == request.PermissionName, cancellationToken);
        }

        var query = _context.GetSet<TenantUser>()
            .AsNoTracking().AsSplitQuery()
            .AsQueryable();

        if (permission != null)
        {
            var usersWithDirectPermission = await _context.GetSet<UserPermission>()
                .Where(up => up.PermissionId == permission.Id)
                .Select(up => up.User)
                .ToListAsync(cancellationToken);

            var rolesWithPermission = await _context.GetSet<RolePermission>()
                .Where(rp => rp.PermissionId == permission.Id)
                .Select(rp => rp.RoleId)
                .ToListAsync(cancellationToken);

            var usersInRolesWithPermission = new List<TenantUser>();
            foreach (var roleId in rolesWithPermission)
            {
                var role = await _context.GetSet<IdentityRole<Guid>>()
                    .FirstOrDefaultAsync(r => r.Id == roleId, cancellationToken);
                if (role != null)
                {
                    var users = await _userManager.GetUsersInRoleAsync(role.Name!);
                    usersInRolesWithPermission.AddRange(users.Cast<TenantUser>());
                }
            }

            var allUsersWithPermissionIds = usersWithDirectPermission
                .Concat(usersInRolesWithPermission)
                .DistinctBy(u => u.Id)
                .Select(u => u.Id)
                .ToList();

            query = query.Where(u => allUsersWithPermissionIds.Contains(u.Id) && u.IsActive);
        }
        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<TenantUserDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        foreach (var userDto in result.Items)
        {
            var roles = await _context.GetSet<IdentityRole<Guid>>()
                .AsNoTracking().AsSingleQuery()
                .ToListAsync(cancellationToken);

            var userRoles = await _context.GetSet<IdentityUserRole<Guid>>()
                .AsNoTracking().AsSplitQuery()
                .Where(ur => ur.UserId == userDto.Id)
                .ToListAsync(cancellationToken);

            userDto.Roles = roles.Where(r => userRoles.Any(ur => ur.RoleId == r.Id && ur.UserId == userDto.Id))
                .Select(r => r.Name!)
                .ToList();

            var permissions = new List<string>();

            var userPermissions = await _context.GetSet<UserPermission>()
                .Where(up => up.UserId == userDto.Id)
                .Select(up => up.Permission.Name)
                .ToListAsync(cancellationToken);
            permissions.AddRange(userPermissions);
            if (!userDto.RolePermissions.ContainsKey("Extra"))
            {
                userDto.RolePermissions["Extra"] = new List<string>();
            }

            userDto.RolePermissions["Extra"].AddRange(userPermissions);


            foreach (var roleName in userDto.Roles)
            {
                var role = await _context.GetSet<IdentityRole<Guid>>()
                    .FirstOrDefaultAsync(r => r.Name == roleName, cancellationToken);
                if (role is not null)
                {
                    var rolePermissions = await _context.GetSet<RolePermission>()
                        .Where(rp => rp.RoleId == role.Id)
                        .Select(rp => rp.Permission.Name)
                        .ToListAsync(cancellationToken);
                    permissions.AddRange(rolePermissions);
                    if (!userDto.RolePermissions.ContainsKey(roleName))
                    {
                        userDto.RolePermissions[roleName] = new List<string>();
                    }

                    userDto.RolePermissions[roleName].AddRange(rolePermissions);
                }
            }

            userDto.Permissions = permissions.Distinct().ToList();
        }

        return Result<GetUsersWithPermissionResponse>.Success(result);
    }
}
