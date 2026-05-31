using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class DocumentFile(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public DocumentFile(): this(Guid.NewGuid()) { }
    public Guid FileId { get; set; }
    [ForeignKey(nameof(FileId))] public Folder? File { get; set; }

    public Guid DocumentVersionId { get; set; }

    [ForeignKey(nameof(DocumentVersionId))]
    public DocumentVersion? DocumentVersion { get; set; }
}
