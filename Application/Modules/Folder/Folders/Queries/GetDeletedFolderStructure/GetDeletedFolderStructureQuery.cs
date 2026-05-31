using Novologs.Application.Modules.Folder.Folders.Dto;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using MediatR;

namespace Novologs.Application.Modules.Folder.Folders.Queries.GetDeletedFolderStructure;

public record GetDeletedFolderStructureQuery : IRequest<Result<List<FolderDto>>>
{
}
