using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.User.Dto;
using Novologs.Domain.Entities;

namespace Novologs.Application.User.Queries.GetUser;

public record GetUserQuery : IRequest<Result<TenantUserDto>>
{
    public Guid Id { get; set; }
}

public class GetUserQueryValidator : AbstractValidator<GetUserQuery>
{
    public GetUserQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetUserQueryHandler : IRequestHandler<GetUserQuery, Result<TenantUserDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetUserQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<TenantUserDto>> Handle(GetUserQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GetSet<TenantUser>("").AsNoTracking().AsSplitQuery();
        var user = await query.Where(u => u.Id == request.Id && u.IsActive)
            .ProjectTo<TenantUserDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        var roles = await _context.GetSet<IdentityRole<Guid>>("")
            .AsNoTracking().AsSingleQuery()
            .ToListAsync(cancellationToken);

        if (user is not null)
        {
            var userRoles = await _context.GetSet<IdentityUserRole<Guid>>("")
                    .AsNoTracking().AsSplitQuery()
                    .Where(ur => ur.UserId == user.Id)
                    .ToListAsync(cancellationToken)
                ;

            user.Roles = roles.Where(r => userRoles.Any(ur => ur.RoleId == r.Id && ur.UserId == user.Id))
                .Select(r => r.Name!)
                .ToList();
            
            //add permissions
            var permissions = new List<string>();

            var userPermissions = await _context.GetSet<UserPermission>()
                .Where(up => up.UserId == user.Id)
                .Select(up => up.Permission.Name)
                .ToListAsync(cancellationToken);
            permissions.AddRange(userPermissions); 
            if (!user.RolePermissions.ContainsKey("Extra"))
            {
                user.RolePermissions["Extra"] = new List<string>();
            }
            user.RolePermissions["Extra"].AddRange(userPermissions);


            foreach (var roleName in user.Roles)
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
                    //add role permission mapping
                    if (!user.RolePermissions.ContainsKey(roleName))
                    {
                        user.RolePermissions[roleName] = new List<string>();
                    }
                    user.RolePermissions[roleName].AddRange(rolePermissions);

                } 
            }

            user.Permissions = permissions.Distinct().ToList();

            return Result<TenantUserDto>.Success(user);
        }
        else
        {
            return Result<TenantUserDto>.Failure(new List<ErrorItem>() { new ErrorItem("User_003", "User not found") });
        }
    }
}
