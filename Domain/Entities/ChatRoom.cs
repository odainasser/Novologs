using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ChatRoom(Guid id) : BaseDeletableAuditableEntity<Guid>(id), ICodeAndSerialEntity
{
    public ChatRoom() : this(Guid.NewGuid()) { }
    public string? Code { get; set; }
    public long Serial { get; set; }
    public string? Name { get; set; }
    public Guid CreatorId { get; set; }
    public bool IsAiRoom { get; set; } = false;
    [ForeignKey(nameof(CreatorId))] public TenantUser? Creator { get; set; }

    public List<ChatRoomMember> Members { get; set; } = new();
    public List<ChatMessage> ChatMessages { get; set; } = new();
}
