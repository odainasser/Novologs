using System.ComponentModel;
using Novologs.Application.Modules.Folder.Folders.Dto;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Folder.Folders.Queries.GetDeletedItems;
public class GetDeletedItemsResponse : FilteredResult<FolderDto>
{
}

public record GetDeletedItemsQuery : IRequest<Result<GetDeletedItemsResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }

    public SortFilter? Sort { get; set; }

    public PaginationFilter? Pagination { get; set; }

    public FolderParentEntity EntityType { get; set; } = FolderParentEntity.None;

    public Guid? EntityId { get; set; }
}