using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.UserGroups.Queries.GetUserGroup;

public record GetUserGroupQuery : IRequest<Result<GetUserGroupResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetUserGroupResponse : FilteredResult<UserGroupDto>
{
}

public class GetUserGroupQueryValidator : AbstractValidator<GetUserGroupQuery>
{
    public GetUserGroupQueryValidator(ITenantDbContext context, IUser user)
    {
    }
}

public class GetUserGroupQueryHandler : IRequestHandler<GetUserGroupQuery, Result<GetUserGroupResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IUser _user;
    private readonly IMapper _mapper;


    public GetUserGroupQueryHandler(ITenantDbContext context, IUser user,
        UserManager<TenantUser> userManager, IMapper mapper)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<Result<GetUserGroupResponse>> Handle(GetUserGroupQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetUserGroupResponse();
        var query = _context.GetSet<UserGroup>()
            .Include(g => g.CreatorUser)
            .Include(g => g.Members)
            .AsNoTracking().AsSplitQuery();
        //check of user id is null
        if (_user.IdGuid == null)
        {
            return Result<GetUserGroupResponse>.Failure("User_001", "User not found.");
        }

        //check if he has read permission, or it should be group member 
        var hasPermission = await _userManager.HasPermissionAsync(_context, _user.IdGuid.Value,
            Domain.Constants.Permissions.UserSalesGroup.ReadUserGroup);
        if (!hasPermission)

        {
            query = query.Where(ug => ug.Members.Any(m => m.UserId == _user.IdGuid));
        }

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<UserGroupDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetUserGroupResponse>.Success(result);
    }
}
