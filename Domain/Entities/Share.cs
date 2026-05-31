using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class Share(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public Share() : this(Guid.NewGuid()) { }

    public Guid FolderId { get; set; }
    [ForeignKey(nameof(FolderId))] public Folder? Folder { get; set; }

    public Guid SharedByUserId { get; set; }
    [ForeignKey(nameof(SharedByUserId))] public TenantUser? SharedByUser { get; set; }

    public Guid SharedWithUserId { get; set; }
    [ForeignKey(nameof(SharedWithUserId))] public TenantUser? SharedWithUser { get; set; }

    public FolderSharePermissionLevel PermissionLevel { get; set; } = FolderSharePermissionLevel.View;
}
