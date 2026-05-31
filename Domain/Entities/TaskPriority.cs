using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class TaskPriority(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{ 
    public TaskPriority() : this(Guid.NewGuid()) { } 

    public Guid NameId { get; set; }
    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; }
}
