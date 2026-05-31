using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class DocumentVersion(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public DocumentVersion() : this(Guid.NewGuid()) { }

    public string? Version { get; set; } = null;
    public string? Title { get; set; } = null!;
    public string? Description { get; set; } = null!;
    public string Content { get; set; } = null!;

    public Guid? HeaderImgFileId { get; set; }
    [ForeignKey(nameof(HeaderImgFileId))] public Folder? HeaderImgFile { get; set; }

    public Guid NodeId { get; set; }
    [ForeignKey(nameof(NodeId))] public DocumentNode? Node { get; set; }

    public List<DocumentFile> Files { get; set; } = new();
}
