using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Folder.Folders.Dto;

public class FolderMemberDto
{
    public Guid Id { get; set; }
    public FolderSharePermissionLevel FolderSharePermissionLevel { get; set; } = FolderSharePermissionLevel.View;
}