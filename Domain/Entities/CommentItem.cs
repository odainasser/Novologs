using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class CommentItem(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public CommentItem() : this(Guid.NewGuid()) { }

    public string? Content { get; set; }

    public Guid ThreadId { get; set; }
    [ForeignKey(nameof(ThreadId))] public CommentThread? Thread { get; set; }

    public Guid SenderId { get; set; }
    [ForeignKey(nameof(SenderId))] public TenantUser? Sender { get; set; }

    public List<CommentFile> Files { get; set; } = new();
    public List<CommentMention> Mentions { get; set; } = new();
}
