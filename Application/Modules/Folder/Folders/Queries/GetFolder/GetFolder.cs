using System.ComponentModel;
using Novologs.Application.Modules.Folder.Folders.Dto;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Folder.Folders.Queries.GetFolder;

public record GetFolderQuery : IRequest<Result<GetFolderResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Name\", \"IsFile\", \"MimeType\", \"Size\", \"Url\", \"Path\")," +
        " FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }

    [Description(
        "Specifies the primary entity to filter folders by (e.g., Project, Milestone). Defaults to 'None'. See FolderParentEntity " +
        "enum for options: None (0), Project (1), Milestone (2), Client (3), Lead (4), Vendor (5), Contract (6), Folder (7), Task (8).")]
    public FolderParentEntity EntityType { get; set; } = FolderParentEntity.None;

    [Description(
        "The ID of the entity specified by EntityType. Used for filtering folders related to that specific entity instance.")]
    public Guid? EntityId { get; set; }
}

public class GetFolderResponse : FilteredResult<FolderDto>
{
}

public class GetFolderQueryHandler : IRequestHandler<GetFolderQuery, Result<GetFolderResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public GetFolderQueryHandler(
        ITenantDbContext context,
        IUser user,
        IMapper mapper
    )
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<GetFolderResponse>> Handle(GetFolderQuery request, CancellationToken cancellationToken)
    {
        var result = new GetFolderResponse();

        Guid.TryParse(_user.Id, out var userId);

        var baseQuery = _context.GetSet<Novologs.Domain.Entities.Folder>("");
        if (request.EntityType == FolderParentEntity.DeletedItems)
        {
            baseQuery = baseQuery.IgnoreQueryFilters().Where(f => f.IsDeleted);
        }

        var query = baseQuery
            .Include(f => f.Shares)
            .AsNoTracking()
            .AsSplitQuery();

        #region Entity Filtering

        if (request.EntityType == FolderParentEntity.All || request.EntityType == FolderParentEntity.DeletedItems)
        {
            // no filter
        }
        else if (request.EntityType == FolderParentEntity.None)
        {
            // Root level only
            query = query.Where(f =>
                f.ParentFolderId == null &&
                f.ProjectId == null &&
                f.MissionId == null &&
                f.MilestoneId == null &&
                f.ClientId == null &&
                f.LeadId == null &&
                f.VendorId == null &&
                f.ContractId == null &&
                f.TaskId == null);
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
            // Only items inside selected folder
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
        else if (request.EntityType == FolderParentEntity.MyShare)
        {
            // Only directly shared items
            query = query.Where(f =>
                f.Shares.Any(s => s.SharedWithUserId == userId));
        }

        #endregion

        #region Access Control

        query = query.Where(f =>

            // Root General folders only
            (
                f.Type == FolderType.General &&
                f.ParentFolderId == null
            )

            ||

            // Shared explicitly with current user
            (
                f.Type == FolderType.Shared &&
                f.Shares.Any(s => s.SharedWithUserId == userId)
            )

            ||

            // Creator access
            f.CreatorId == userId

            ||

            // Direct share access
            f.Shares.Any(s => s.SharedWithUserId == userId)

            ||

            // Entity membership access
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

        query = query.ApplySearch(request.Search);

        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);

        query = query.ApplyPagination(request.Pagination);

        var items = await query
            .ProjectTo<FolderDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        // Put system folder first
        if (request.EntityType == FolderParentEntity.None)
        {
            var systemFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>("")
                .Where(f =>
                    f.Type == FolderType.General &&
                    f.ParentFolderId == null)
                .ProjectTo<FolderDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (systemFolder != null)
            {
                items.RemoveAll(x => x.Id == systemFolder.Id);
                items.Insert(0, systemFolder);
            }
        }

        result.Items = items;

        return Result<GetFolderResponse>.Success(result);
    }
}
