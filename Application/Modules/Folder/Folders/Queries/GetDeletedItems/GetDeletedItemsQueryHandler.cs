using System.ComponentModel;
using Novologs.Application.Modules.Folder.Folders.Dto;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Domain.Enums;
namespace Novologs.Application.Modules.Folder.Folders.Queries.GetDeletedItems;

public class GetDeletedItemsQueryHandler
    : IRequestHandler<GetDeletedItemsQuery, Result<GetDeletedItemsResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public GetDeletedItemsQueryHandler(
        ITenantDbContext context,
        IUser user,
        IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<GetDeletedItemsResponse>> Handle(
        GetDeletedItemsQuery request,
        CancellationToken cancellationToken)
    {
       var result = new GetDeletedItemsResponse();

        Guid.TryParse(_user.Id, out var userId);

        var query = _context.GetSet<Novologs.Domain.Entities.Folder>("")
            .IgnoreQueryFilters()
            .Include(f => f.Shares)
            .AsNoTracking()
            .AsSplitQuery()

            // Only deleted items
            .Where(f => f.IsDeleted);

        #region Entity Filtering

        if (request.EntityType == FolderParentEntity.All || request.EntityType == FolderParentEntity.DeletedItems)
        {
            // no filter
        }
        else if (request.EntityType == FolderParentEntity.None)
        {
            query = query.Where(f =>
                f.ParentFolderId == null &&
                f.ProjectId == null &&
                f.MilestoneId == null &&
                f.ClientId == null &&
                f.LeadId == null &&
                f.VendorId == null &&
                f.ContractId == null &&
                f.TaskId == null && 
                f.MissionId == null);
        }
        else if (request.EntityType == FolderParentEntity.Project)
        {
            query = query.Include(f => f.Project)
                .Where(f => f.ProjectId == request.EntityId);
        }
        else if (request.EntityType == FolderParentEntity.Mission)
        {
            query = query.Include(f => f.Mission)
                .Where(f => f.MissionId == request.EntityId);
        }
        else if (request.EntityType == FolderParentEntity.Milestone)
        {
            query = query.Include(f => f.Milestone!.Project)
                .Where(f => f.MilestoneId == request.EntityId);
        }
        else if (request.EntityType == FolderParentEntity.Client)
        {
            query = query.Include(f => f.Client)
                .Where(f => f.ClientId == request.EntityId);
        }
        else if (request.EntityType == FolderParentEntity.Lead)
        {
            query = query.Include(f => f.Lead)
                .Where(f => f.LeadId == request.EntityId);
        }
        else if (request.EntityType == FolderParentEntity.Vendor)
        {
            query = query.Include(f => f.Vendor)
                .Where(f => f.VendorId == request.EntityId);
        }
        else if (request.EntityType == FolderParentEntity.Contract)
        {
            query = query.Include(f => f.Contract)
                .Where(f => f.ContractId == request.EntityId);
        }
        else if (request.EntityType == FolderParentEntity.Folder)
        {
            query = query.Include(f => f.ParentFolder)
                .Where(f => f.ParentFolderId == request.EntityId);
        }
        else if (request.EntityType == FolderParentEntity.Task)
        {
            query = query.Include(f => f.Task)
                .Where(f => f.TaskId == request.EntityId);
        }
        else if (request.EntityType == FolderParentEntity.Document)
        {
            query = query.Where(f => f.DocumentNodeId == request.EntityId);
        }
        
        #endregion

        #region Access Control

        query = query.Where(f =>

            // Creator can see deleted items
            f.CreatorId == userId

            ||

            // Project members
            (
                !f.Shares.Any() &&
                (
                    (f.Project != null &&
                    f.Project.ProjectMembers.Any(m => m.MemberId == userId))

                    ||

                    (f.Mission != null &&
                    f.Mission.ProjectMembers.Any(m => m.MemberId == userId))

                    ||

                    (f.Milestone != null &&
                    f.Milestone.Project!.ProjectMembers.Any(m => m.MemberId == userId))

                    ||

                    (f.Client != null &&
                    f.Client.CreatorId == userId)

                    ||

                    (f.Lead != null &&
                    f.Lead.CreatorId == userId)

                    ||

                    (f.Vendor != null &&
                    f.Vendor.CreatorId == userId)

                    ||

                    (f.Contract != null &&
                    f.Contract.CreatorId == userId)

                    ||

                    (f.Task != null &&
                    f.Task.Members.Any(m => m.MemberId == userId))
                )
            )
        );

        #endregion

        // EXCLUDE shared files completely
        query = query.Where(f => !f.Shares.Any());

        query = query.ApplySearch(request.Search);

        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);

        query = query.ApplyPagination(request.Pagination);

        var items = await query
            .ProjectTo<FolderDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        result.Items = items;

        return Result<GetDeletedItemsResponse>.Success(result);
    }
    
}
