using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.User.Dto;
using Novologs.Domain.Entities;

namespace Novologs.Application.User.Queries.GetUserInfo;

public record GetUserInfoQuery : IRequest<Result<TenantUserDto>>
{
}


public class GetUserInfoQueryValidator : AbstractValidator<GetUserInfoQuery>
{
    public GetUserInfoQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetUserInfoQueryHandler : IRequestHandler<GetUserInfoQuery, Result<TenantUserDto>>
{
    private readonly ITenantDbContext _context;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;

    public GetUserInfoQueryHandler(
        ITenantDbContext context,
        UserManager<TenantUser> userManager,
        IMapper mapper,
        IUser user,
        RoleManager<IdentityRole<Guid>> roleManager)
    {
        _context = context;
        _userManager = userManager;
        _mapper = mapper;
        _user = user;
        _roleManager = roleManager;
    }

    public async Task<Result<TenantUserDto>> Handle(GetUserInfoQuery request, CancellationToken cancellationToken)
    {
        if (_user.IdGuid is null) return Result<TenantUserDto>.Failure("UserNotFound", "User not found");

        var userDb = await _context.GetSet<TenantUser>()
            .Where(u => u.Id == _user.IdGuid)
            .FirstOrDefaultAsync(cancellationToken);

        if (userDb is null) return Result<TenantUserDto>.Failure("UserNotFound", "User not found");

        var roles = await _userManager.GetRolesAsync(userDb);
        var permissions = new List<string>();

        var userPermissions = await _context.GetSet<UserPermission>()
            .Where(up => up.UserId == userDb.Id)
            .Select(up => up.Permission.Name)
            .ToListAsync(cancellationToken);
        permissions.AddRange(userPermissions);
        var RolePermissions= new Dictionary<string, List<string>>();
        if (!RolePermissions.ContainsKey("Extra"))
        {
            RolePermissions["Extra"] = new List<string>();
        }
        RolePermissions["Extra"].AddRange(userPermissions);


        foreach (var roleName in roles)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role is not null)
            {
                var rolePermissions = await _context.GetSet<RolePermission>()
                    .Where(rp => rp.RoleId == role.Id)
                    .Select(rp => rp.Permission.Name)
                    .ToListAsync(cancellationToken);
                permissions.AddRange(rolePermissions);
                if (!RolePermissions.ContainsKey(roleName))
                {
                    RolePermissions[roleName] = new List<string>();
                }
                RolePermissions[roleName].AddRange(rolePermissions);

            }
        }

        var userInfo = await _context.GetSet<TenantUser>()
            .Where(u => u.Id == userDb.Id)
            .ProjectTo<TenantUserDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        if (userInfo != null)
        {
            userInfo.Roles = roles.ToList();
            userInfo.Permissions = permissions.Distinct().ToList();
            userInfo.RolePermissions = RolePermissions;
            return Result<TenantUserDto>.Success(userInfo);
        }

        return Result<TenantUserDto>.Failure("UserNotFound", "User info not found");
    }
}
