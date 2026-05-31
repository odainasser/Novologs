using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ChatMessageReciever(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public ChatMessageReciever() : this(Guid.NewGuid()) { }
    public ChatReciverMessageSeenStatus Status { get; set; } = ChatReciverMessageSeenStatus.NotDelevered;
    public Guid ChatMessageId { get; set; }
    [ForeignKey(nameof(ChatMessageId))] public ChatMessage? ChatMessage { get; set; }
    public Guid RecieverId { get; set; }
    [ForeignKey(nameof(RecieverId))] public TenantUser? Reciever { get; set; }
}
