using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class TodoItemMember(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public bool IsOwner { get; set; } = false;
    
    public TodoStatus Status { get; set; } = TodoStatus.Pending;

    public Guid TodoId { get; set; }
    [ForeignKey(nameof(TodoId))] public TodoItem? Todo { get; set; }

    public Guid MemberId { get; set; }
    [ForeignKey(nameof(MemberId))] public TenantUser? Member { get; set; }
}
