using AutoMapper;
using Novologs.Application.Modules.Folder.Folders.Dto;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Folder.Folders.Queries.GetDeletedFolderStructure;

public class GetDeletedFolderStructureQueryHandler : IRequestHandler<GetDeletedFolderStructureQuery, Result<List<FolderDto>>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public GetDeletedFolderStructureQueryHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<List<FolderDto>>> Handle(GetDeletedFolderStructureQuery request, CancellationToken cancellationToken)
    {
        Guid.TryParse(_user.Id, out var userId);

        var allFoldersQuery = _context.GetSet<Novologs.Domain.Entities.Folder>("")
            .IgnoreQueryFilters()
            .Include(f => f.Creator)
            .Include(f => f.Project)
            .Include(f => f.Mission)
            .Include(f => f.Milestone)
            .Include(f => f.Client)
            .Include(f => f.Lead)
            .Include(f => f.Vendor)
            .Include(f => f.Contract)
            .Include(f => f.Task)
            .AsNoTracking();

        var deletedItems = await allFoldersQuery
            .Where(f => f.IsDeleted)
            .Where(f =>
                f.CreatorId == userId
                ||
                (!f.Shares.Any() &&
                (
                    (f.Project != null && f.Project.ProjectMembers.Any(m => m.MemberId == userId))
                    ||
                    (f.Mission != null && f.Mission.ProjectMembers.Any(m => m.MemberId == userId))
                    ||
                    (f.Milestone != null && f.Milestone.Project!.ProjectMembers.Any(m => m.MemberId == userId))
                    ||
                    (f.Client != null && f.Client.CreatorId == userId)
                    ||
                    (f.Lead != null && f.Lead.CreatorId == userId)
                    ||
                    (f.Vendor != null && f.Vendor.CreatorId == userId)
                    ||
                    (f.Contract != null && f.Contract.CreatorId == userId)
                    ||
                    (f.Task != null && f.Task.Members.Any(m => m.MemberId == userId))
                ))
            )
            .ToListAsync(cancellationToken);

        if (!deletedItems.Any())
            return Result<List<FolderDto>>.Success(new List<FolderDto>());

        var includedFolders = new Dictionary<Guid, Novologs.Domain.Entities.Folder>();
        foreach(var f in deletedItems) includedFolders[f.Id] = f;

        var parentIdsToFetch = deletedItems
            .Where(f => f.ParentFolderId.HasValue && !includedFolders.ContainsKey(f.ParentFolderId.Value))
            .Select(f => f.ParentFolderId!.Value)
            .Distinct()
            .ToList();

        while (parentIdsToFetch.Any())
        {
            var parents = await allFoldersQuery
                .Where(f => parentIdsToFetch.Contains(f.Id))
                .ToListAsync(cancellationToken);

            foreach(var p in parents) includedFolders[p.Id] = p;

            parentIdsToFetch = parents
                .Where(f => f.ParentFolderId.HasValue && !includedFolders.ContainsKey(f.ParentFolderId.Value))
                .Select(f => f.ParentFolderId!.Value)
                .Distinct()
                .ToList();
        }

        var treeNodes = new Dictionary<Guid, FolderDto>();
        var rootNodes = new List<FolderDto>();

        foreach (var f in includedFolders.Values)
        {
            var dto = _mapper.Map<FolderDto>(f);
            treeNodes[f.Id] = dto;
        }

        foreach (var dto in treeNodes.Values)
        {
            if (dto.ParentFolderId.HasValue && treeNodes.TryGetValue(dto.ParentFolderId.Value, out var parentDto))
            {
                // To avoid duplicate additions if somehow processing twice (though Dictionary prevents this)
                if (!parentDto.Subfolders.Any(s => s.Id == dto.Id))
                {
                    parentDto.Subfolders.Add(dto);
                }
            }
            else
            {
                rootNodes.Add(dto);
            }
        }

        // Return only the roots of the reconstructed trees
        return Result<List<FolderDto>>.Success(rootNodes);
    }
}
