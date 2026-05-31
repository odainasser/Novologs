using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ChatRoomMember(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public ChatRoomMemberRole Role { get; set; } = ChatRoomMemberRole.Member;
    public ChatRoomMember() : this(Guid.NewGuid()) { }
    public Guid MemberId { get; set; }
    [ForeignKey(nameof(MemberId))] public TenantUser? Member { get; set; }
    public Guid ChatRoomId { get; set; }
    [ForeignKey(nameof(ChatRoomId))] public ChatRoom? ChatRoom { get; set; }
}
