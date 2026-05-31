using System.ComponentModel;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Modules.Project.Projects.Dto;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Tenant;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Project.Projects.Queries.GetProject;

[Description("Retrieves a list of projects with pagination, sorting, and filtering options.")]
public record GetProjectQuery : IRequest<Result<GetProjectResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Code\", \"Serial\" , \"Name\", \"Description\", \"StartDate\", \"EndDate\", " +
        "\"CreatorId\", \"DepartmentId\", \"ClientId\", \"GoalId\", \"InitiativeId\", \"FolderId\", \"DocumentId\")," +
        " FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }

    public ProjectType? Type { get; set; } = null;
}

public class GetProjectResponse : FilteredResult<ProjectDto>
{
}

public class GetProjectQueryValidator : AbstractValidator<GetProjectQuery>
{
    public GetProjectQueryValidator()
    {
    }
}

public class GetProjectQueryHandler : IRequestHandler<GetProjectQuery, Result<GetProjectResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public GetProjectQueryHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user
    )
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<GetProjectResponse>> Handle(GetProjectQuery request, CancellationToken cancellationToken)
    {
        var result = new GetProjectResponse();

        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<GetProjectResponse>.Failure("Project_001", "User not found.");
        }

        // Load all effective permissions in one batch instead of 3 sequential HasPermissionAsync calls
        var userDirectPermissions = await _context.GetSet<UserPermission>()
            .AsNoTracking()
            .Where(up => up.UserId == userId)
            .Select(up => up.Permission.Name)
            .ToListAsync(cancellationToken);

        var userRoleIds = await _context.GetSet<IdentityUserRole<Guid>>()
            .AsNoTracking()
            .Where(ur => ur.UserId == userId)
            .Select(ur => ur.RoleId)
            .ToListAsync(cancellationToken);

        var rolePermissions = userRoleIds.Count > 0
            ? await _context.GetSet<RolePermission>()
                .AsNoTracking()
                .Where(rp => userRoleIds.Contains(rp.RoleId))
                .Select(rp => rp.Permission.Name)
                .ToListAsync(cancellationToken)
            : new List<string>();

        var effectivePermissions = userDirectPermissions.Concat(rolePermissions).ToHashSet();

        var hasGeneralViewAllPermission = effectivePermissions.Contains(Novologs.Domain.Constants.Permissions.General.ViewAll);
        var hasProjectViewAllPermission = effectivePermissions.Contains(Novologs.Domain.Constants.Permissions.Projects.ViewAll);
        var hasMissionViewAllPermission = effectivePermissions.Contains(Novologs.Domain.Constants.Permissions.Missions.ViewAll);

        var query = _context.GetSet<Novologs.Domain.Entities.Project>("")
            .AsNoTracking().AsSplitQuery();

        if (request.Type.HasValue)
        {
            query = query.Where(p => p.Type == request.Type.Value);
        }

        bool canViewAll = hasGeneralViewAllPermission ||
                          (hasProjectViewAllPermission && (request.Type == ProjectType.Project ||
                                                           request.Type == ProjectType.Ticketing)) ||
                          (hasMissionViewAllPermission && request.Type == ProjectType.Mission) ||
                          (hasProjectViewAllPermission && hasMissionViewAllPermission);

        if (!canViewAll)
        {
            query = query.Where(p =>
                p.ProjectMembers.Any(pm => pm.MemberId == userId) || (p.Type == ProjectType.Ticketing));
        }

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<ProjectDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        // Load folder IDs only for the projects on this page using the direct ProjectId FK
        if (result.Items.Count > 0)
        {
            var projectIds = result.Items
                .Where(p => p.Id.HasValue)
                .Select(p => p.Id!.Value)
                .ToList();

            var folderByProject = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                .AsNoTracking()
                .Where(f => f.Type == FolderType.Shared
                            && f.ProjectId.HasValue
                            && projectIds.Contains(f.ProjectId.Value))
                .Select(f => new { f.Id, f.ProjectId })
                .ToDictionaryAsync(f => f.ProjectId!.Value, f => f.Id, cancellationToken);

            foreach (var projectDto in result.Items)
            {
                if (projectDto.Id.HasValue && folderByProject.TryGetValue(projectDto.Id.Value, out var folderId))
                    projectDto.RootFolderId = folderId;
            }
        }

        return Result<GetProjectResponse>.Success(result);
    }
}
