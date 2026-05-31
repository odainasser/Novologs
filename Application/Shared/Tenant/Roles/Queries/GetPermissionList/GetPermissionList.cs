using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Domain.Entities;

namespace Novologs.Application.Roles.Queries.GetPermissionList;

public record GetPermissionListQuery : IRequest<Result<GetPermissionListResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetPermissionListResponse : FilteredResult<PermissionDto>
{
}

public class PermissionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Permission, PermissionDto>();
            CreateMap<RolePermission, PermissionDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Permission.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Permission.Name))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Permission.Description))
                ;
        }
    }
}

public class GetPermissionListQueryValidator : AbstractValidator<GetPermissionListQuery>
{
    public GetPermissionListQueryValidator()
    {
    }
}

public class GetPermissionListQueryHandler : IRequestHandler<GetPermissionListQuery, Result<GetPermissionListResponse>>
{
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly ITenantDbContext _context;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly UserManager<TenantUser> _userManager;

    public GetPermissionListQueryHandler(
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

    public async Task<Result<GetPermissionListResponse>> Handle(GetPermissionListQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetPermissionListResponse();
        var query = _context.GetSet<Permission>()
            .AsNoTracking();

        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySearch(request.Search);
        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<PermissionDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetPermissionListResponse>.Success(result);
    }
}
