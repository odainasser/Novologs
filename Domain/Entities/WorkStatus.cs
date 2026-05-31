using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class WorkStatus(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public WorkStatus() : this(Guid.NewGuid()) { }
    public bool IsActive { get; set; } = true;
    public Guid NameId { get; set; }
    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; }

    public string? Color { get; set; }
}
