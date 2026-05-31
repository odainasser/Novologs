using System.ComponentModel;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Hierarchy.Utilities;
using Novologs.Application.Tenant;
using Novologs.Application.User.Dto;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.User.Queries.GetUsers;

public record GetUsersQuery : IRequest<Result<GetUsersQueryResponse>>, IFilter
{
    [Description("Search criteria. Specify FieldName, FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName, SortDirection, and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. default null to get all the items")]
    public PaginationFilter? Pagination { get; set; }

    [Description("Filter by active/inactive status. Pass true to return only active users, false for inactive, or omit to return all.")]
    public bool? IsActive { get; set; }
}

public class GetUsersQueryValidator : AbstractValidator<GetUsersQuery>
{
    public GetUsersQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetUsersQueryResponse : FilteredResult<TenantUserDto>
{
}

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, Result<GetUsersQueryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetUsersQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetUsersQueryResponse>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var result = new GetUsersQueryResponse();
        var query = _context.GetSet<TenantUser>("").AsNoTracking().AsSplitQuery();
        if (request.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == request.IsActive.Value);
        }
        try
        {
            query = query.ApplySearch(request.Search);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }

        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query
            .ProjectTo<TenantUserDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        var organizationList = _context
            .GetSet<OrganizationStructure>("Employee,Department.Name.LocalizedStrings")
            .AsNoTracking().AsSplitQuery();
        var hierarchDic =
            HierarchUtil.GetEmployeesLevelAndManagerDictionary(
                organizationList.FirstOrDefault(o => o.ParentStructureId == null));
        foreach (var user in result.Items)
        {
            if (hierarchDic.TryGetValue(user.Id!.Value, out var hierarchItem))
            {
                user.Level = hierarchItem.Level;
                user.ParentId = hierarchItem.Parent?.Id;
                user.ParentName = hierarchItem.Parent?.FullName;
            }
        }

        if (result.Items.Any())
        {
            var userIds = result.Items.Select(u => u.Id!.Value).ToList();
            var roles = await _context.GetSet<IdentityRole<Guid>>("")
                .AsNoTracking().AsSingleQuery()
                .ToListAsync(cancellationToken);
            var userRoles = await _context.GetSet<IdentityUserRole<Guid>>("")
                    .AsNoTracking().AsSplitQuery()
                    .Where(ur => userIds.Contains(ur.UserId))
                    .ToListAsync(cancellationToken)
                ;

            foreach (var user in result.Items)
            {
                user.Roles = roles.Where(r => userRoles.Any(ur => ur.RoleId == r.Id && ur.UserId == user.Id))
                    .Select(r => r.Name!)
                    .ToList();
            }
        }
        
        foreach (var user in result.Items)
        {
            var userFolder = await _context.GetSet<Folder>()
                .Where(f => f.CreatorId == user.Id
                         && f.Type == FolderType.Normal
                         && f.ParentFolder != null
                         && f.ParentFolder.Name == Constants.FolderNames.Users
                         && f.ParentFolder.Type == FolderType.General)
                .Select(f => f.Id)
                .FirstOrDefaultAsync(cancellationToken);
            user.RootFolderId = userFolder == Guid.Empty ? null : (Guid?)userFolder;
        }


        return Result<GetUsersQueryResponse>.Success(result);
    }
}
