using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class TimeSheet(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public TimeSheet() : this(Guid.NewGuid()) { }

    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))] public TenantUser? User { get; set; }

    public Guid TaskId { get; set; }
    [ForeignKey(nameof(TaskId))] public ProjectTask? Task { get; set; }

    public DateTime Date { get; set; }

    public List<TimeSlot> TimeSlots { get; set; } = new();
}
