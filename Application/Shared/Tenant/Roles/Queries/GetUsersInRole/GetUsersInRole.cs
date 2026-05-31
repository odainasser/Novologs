using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.User.Dto;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Queries.GetUsersInRole;

public record GetUsersInRoleQuery : IRequest<Result<GetUsersInRoleResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
    public Guid? RoleId { get; set; }
    public string? RoleName { get; set; }
}

public class GetUsersInRoleResponse : FilteredResult<TenantUserDto>
{
}

public class GetUsersInRoleQueryValidator : AbstractValidator<GetUsersInRoleQuery>
{
    public GetUsersInRoleQueryValidator(ITenantDbContext context)
    {
        RuleFor(x => x)
            .Must(x => x.RoleId.HasValue || !string.IsNullOrEmpty(x.RoleName))
            .WithMessage("Either RoleId or RoleName must be provided.");

        When(x => x.RoleId.HasValue, () =>
        {
            RuleFor(x => x.RoleId)
                .MustAsync(async (roleId, cancellationToken) =>
                {
                    var role = await context.GetSet<IdentityRole<Guid>>()
                        .FirstOrDefaultAsync(r => r.Id == roleId, cancellationToken);
                    return role != null;
                }).WithMessage("Role not found.");
        });

        When(x => !string.IsNullOrEmpty(x.RoleName), () =>
        {
            RuleFor(x => x.RoleName)
                .MustAsync(async (roleName, cancellationToken) =>
                {
                    var role = await context.GetSet<IdentityRole<Guid>>()
                        .FirstOrDefaultAsync(r => r.Name == roleName, cancellationToken);
                    return role != null;
                }).WithMessage("Role not found.");
        });
    }
}

public class GetUsersInRoleQueryHandler : IRequestHandler<GetUsersInRoleQuery, Result<GetUsersInRoleResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly UserManager<TenantUser> _userManager;

    public GetUsersInRoleQueryHandler(
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

    public async Task<Result<GetUsersInRoleResponse>> Handle(GetUsersInRoleQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetUsersInRoleResponse();

        IdentityRole<Guid>? role = null;

        if (request.RoleId.HasValue)
        {
            role = await _roleManager.FindByIdAsync(request.RoleId.Value.ToString());
        }
        else if (!string.IsNullOrEmpty(request.RoleName))
        {
            role = await _roleManager.FindByNameAsync(request.RoleName);
        }

        if (role == null)
        {
            return Result<GetUsersInRoleResponse>.Failure(new List<ErrorItem>()
            {
                new ErrorItem("Role_001", "Role not found")
            });
        }


        var usersInRole = await _userManager.GetUsersInRoleAsync(role.Name!);
        var usersInRoleIds = usersInRole.Select(u => u.Id).ToList();

        var query = _context.GetSet<TenantUser>()
            .AsNoTracking().AsSplitQuery()
            .Where(u => usersInRoleIds.Contains(u.Id) && u.IsActive)
            .AsQueryable();

        result.Total = query.Count();

        query = query.ApplySearch(request.Search);
        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<TenantUserDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetUsersInRoleResponse>.Success(result);
    }
}
