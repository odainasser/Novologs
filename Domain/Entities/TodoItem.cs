using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class TodoItem(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public TodoItem() : this(Guid.NewGuid()) { }

    public string Content { get; set; } = null!;
    public DateTime? ReminderDateTime { get; set; }
    
    public Guid? TaskId { get; set; }
    [ForeignKey(nameof(TaskId))] public ProjectTask? Task { get; set; }

    public Guid? LeadUpdateId { get; set; }
    [ForeignKey(nameof(LeadUpdateId))] public LeadUpdate? LeadUpdate { get; set; }

    public List<TodoItemMember> Members { get; set; } = new();
}
