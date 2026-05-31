using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

/// <summary>
/// Tracks which messages each user has deleted for themselves (DeletedForMe)
/// </summary>
public class ChatMessageUserDeletion(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public ChatMessageUserDeletion() : this(Guid.NewGuid()) { }

    public Guid ChatMessageId { get; set; }
    [ForeignKey(nameof(ChatMessageId))] public ChatMessage? ChatMessage { get; set; }

    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))] public TenantUser? User { get; set; }
}
