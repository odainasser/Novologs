using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ChatMessageMention(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public ChatMessageMention() : this(Guid.NewGuid()) { }

    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))] public TenantUser? User { get; set; }

    public Guid ChatMessageId { get; set; }
    [ForeignKey(nameof(ChatMessageId))] public ChatMessage? ChatMessage { get; set; }
}
