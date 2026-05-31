using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class CommentMention(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public CommentMention() : this(Guid.NewGuid()) { }

    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))] public TenantUser? User { get; set; }

    public Guid CommentItemId { get; set; }
    [ForeignKey(nameof(CommentItemId))] public CommentItem? CommentItem { get; set; }
}
