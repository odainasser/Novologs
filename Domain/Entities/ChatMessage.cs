using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ChatMessage(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public ChatMessage() : this(Guid.NewGuid()) { }

    public string? PayLoad { get; set; }
    public ChatMessageDeleteStatus DeletedStatus { get; set; } = ChatMessageDeleteStatus.NotDeleted;
    public Guid SenderId { get; set; }
    [ForeignKey(nameof(SenderId))] public TenantUser? Sender { get; set; }
    public Guid? ChatRoomId { get; set; }
    [ForeignKey(nameof(ChatRoomId))] public ChatRoom? ChatRoom { get; set; }

    public Guid? AudioFileId { get; set; }
    [ForeignKey(nameof(AudioFileId))] public Folder? AudioFile { get; set; }

    public List<ChatMessageReciever> Recievers { get; set; } = new();
    public List<ChatMessageReaction> Reactions { get; set; } = new();
    public List<ChatMessageTask> Tasks { get; set; } = new();
    public List<ChatMessageMention> Mentions { get; set; } = new();
}


