using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Application.User.Dto;
using Novologs.Domain.Constants;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Tasks.Queries.GetTaskAvailableUsers;

public record GetTaskAvailableUsersQuery : IRequest<Result<GetTaskAvailableUsersResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }

    public SortFilter? Sort { get; set; }

    public PaginationFilter? Pagination { get; set; }

    public Guid? EmployeeId { get; set; }
}

public class GetTaskAvailableUsersResponse : FilteredResult<TenantUserDto>
{
}

public class GetTaskAvailableUsersQueryValidator : AbstractValidator<GetTaskAvailableUsersQuery>
{
    public GetTaskAvailableUsersQueryValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.EmployeeId)
            .MustAsync(async (employeeId, cancellationToken) =>
            {
                if (employeeId == null)
                {
                    return true;
                }

                return await context.GetSet<TenantUser>()
                    .AnyAsync(u => u.Id == employeeId, cancellationToken);
            }).WithMessage("EmployeeId is not valid.");
    }
}

public class
    GetTaskAvailableUsersQueryHandler : IRequestHandler<GetTaskAvailableUsersQuery,
    Result<GetTaskAvailableUsersResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public GetTaskAvailableUsersQueryHandler(ITenantDbContext context,
        IMapper mapper,
        IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }


    public async Task<Result<GetTaskAvailableUsersResponse>> Handle(GetTaskAvailableUsersQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetTaskAvailableUsersResponse();
        var currentUserId = request.EmployeeId ?? _user.IdGuid;

        var user = await _context.GetSet<TenantUser>().AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);
        if (user == null)
        {
            return Result<GetTaskAvailableUsersResponse>.Failure("User.NotFound", "User not found.");
        }

        // Check HasTaskLevelElevator permission via direct DB query (no UserManager round-trips)
        var currentUserIdForPerm = _user.IdGuid!.Value;
        var hasElevatorPermission = await HasPermissionDirectAsync(
            currentUserIdForPerm, Permissions.Tasks.HasTaskLevelElevator, cancellationToken);

        var taskLevelElveator = hasElevatorPermission ? (user?.TaskLevelElveator ?? 0) : 0;

        List<Guid?> allVisibleUsersIds =
            await GetAllVisibleUsersIds(cancellationToken, currentUserId, taskLevelElveator);

        // Load users excluded from task assignment via direct DB join (no UserManager loop per role)
        var usersWithDontAssignTasksPermissionIds =
            await GetUsersWithPermissionIdsAsync(Permissions.Tasks.DontAssignTasks, cancellationToken);

        allVisibleUsersIds = allVisibleUsersIds
            .Except(usersWithDontAssignTasksPermissionIds)
            .Where(id => id.HasValue)
            .ToList();

        var query = _context.GetSet<TenantUser>()
            .Where(u => allVisibleUsersIds.Contains(u.Id) && u.IsActive)
            .AsNoTracking()
            .AsSplitQuery();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query
            .ProjectTo<TenantUserDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetTaskAvailableUsersResponse>.Success(result);
    }

    private async Task<bool> HasPermissionDirectAsync(Guid userId, string permissionName,
        CancellationToken cancellationToken)
    {
        var hasDirectPermission = await _context.GetSet<UserPermission>()
            .AsNoTracking()
            .AnyAsync(up => up.UserId == userId && up.Permission.Name == permissionName, cancellationToken);

        if (hasDirectPermission) return true;

        return await _context.GetSet<IdentityUserRole<Guid>>()
            .AsNoTracking()
            .Where(ur => ur.UserId == userId)
            .Join(_context.GetSet<RolePermission>(),
                ur => ur.RoleId,
                rp => rp.RoleId,
                (ur, rp) => rp.Permission.Name)
            .AnyAsync(name => name == permissionName, cancellationToken);
    }

    private async Task<List<Guid?>> GetUsersWithPermissionIdsAsync(string permissionName,
        CancellationToken cancellationToken)
    {
        // Users with direct permission
        var directUserIds = await _context.GetSet<UserPermission>()
            .AsNoTracking()
            .Where(up => up.Permission.Name == permissionName)
            .Select(up => (Guid?)up.UserId)
            .ToListAsync(cancellationToken);

        // Users via roles — join IdentityUserRole with RolePermission
        var roleUserIds = await _context.GetSet<RolePermission>()
            .AsNoTracking()
            .Where(rp => rp.Permission.Name == permissionName)
            .Join(_context.GetSet<IdentityUserRole<Guid>>(),
                rp => rp.RoleId,
                ur => ur.RoleId,
                (rp, ur) => (Guid?)ur.UserId)
            .ToListAsync(cancellationToken);

        return directUserIds.Concat(roleUserIds).Distinct().ToList();
    }

    private async Task<List<Guid?>> GetAllVisibleUsersIds(CancellationToken cancellationToken, Guid? currentUserId,
        int taskLevelElveator)
    {
        var organizationStructure = await _context.GetSet<OrganizationStructure>()
            .Include(d => d.Children)
            .AsSingleQuery().AsNoTracking()
            .ToListAsync(cancellationToken);

        var currentUserNode = organizationStructure
            .FirstOrDefault(d => d.EmployeeId == currentUserId);

        var allVisibleUsersIds = new List<Guid?>();

        //get all employee with the same level or more
        if (currentUserNode != null)
        {
            var currentUserLevel = HierarchUtil.GetEmployeeLevel(currentUserNode);
            currentUserLevel = currentUserLevel - taskLevelElveator;
            if (currentUserLevel > 0)
            {
                allVisibleUsersIds.AddRange(HierarchUtil.GetEmployeesInLevel(currentUserNode, currentUserLevel)
                    .Select(id => (Guid?)id));
                allVisibleUsersIds.AddRange(HierarchUtil
                    .GetEmployeeIdsUnderLevel(organizationStructure, currentUserLevel)
                    .Select(id => (Guid?)id));
            }
            else
            {
                allVisibleUsersIds.AddRange(organizationStructure.Where(n => n.EmployeeId.HasValue)
                    .Select(n => n.EmployeeId));
            }
        }
        else
        {
            allVisibleUsersIds.Add(currentUserId);
        }

        allVisibleUsersIds = allVisibleUsersIds.Distinct().ToList();

        return allVisibleUsersIds;
    }
}
