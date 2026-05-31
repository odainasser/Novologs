using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class CommentFile(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public CommentFile() : this(Guid.NewGuid()) { }

    public Guid FileId { get; set; }
    [ForeignKey(nameof(FileId))] public Folder? File { get; set; }

    public Guid CommentItemId { get; set; }
    [ForeignKey(nameof(CommentItemId))] public CommentItem? CommentItem { get; set; }
}
