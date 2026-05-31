using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Roles.Queries.GetPermissionList;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Queries.GetRole;

public record GetRoleQuery : IRequest<Result<GetRoleResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetRoleResponse : FilteredResult<RoleDto>
{
}

public class RoleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public List<PermissionDto> Permissions { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<IdentityRole<Guid>, RoleDto>();
        }
    }
}

public class GetRoleQueryValidator : AbstractValidator<GetRoleQuery>
{
    public GetRoleQueryValidator()
    {
    }
}

public class GetRoleQueryHandler : IRequestHandler<GetRoleQuery, Result<GetRoleResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly UserManager<TenantUser> _userManager;

    public GetRoleQueryHandler(
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

    public async Task<Result<GetRoleResponse>> Handle(GetRoleQuery request, CancellationToken cancellationToken)
    {
        var result = new GetRoleResponse();
        var query = _context.GetSet<IdentityRole<Guid>>()
            .AsNoTracking();

        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySearch(request.Search);
        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        var roles = await query.ProjectTo<RoleDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
        var permissionsList = (await _context.GetSet<RolePermission>()
            .Include(rp => rp.Permission)
            .ToListAsync(cancellationToken)).AsQueryable();
        foreach (var role in roles)
        {
            var permissions = permissionsList
                .Where(rp => rp.RoleId == role.Id)
                .ProjectTo<PermissionDto>(_mapper.ConfigurationProvider)
                .ToList();
            role.Permissions = permissions;
        }

        result.Items = roles;

        return Result<GetRoleResponse>.Success(result);
    }
}
