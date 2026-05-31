using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class TimeSlot(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public TimeSlot() : this(Guid.NewGuid()) { }

    public Guid TimeSheetId { get; set; }
    [ForeignKey(nameof(TimeSheetId))] public TimeSheet? TimeSheet { get; set; }

    public DateTime StartTime { get; set; }
    public TimeSpan Duration { get; set; }

    public string? Description { get; set; }
}
