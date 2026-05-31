using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class TaskCategory(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{ 
    public TaskCategory() : this(Guid.NewGuid()) { }
    

    public Guid NameId { get; set; }
    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; }
}
