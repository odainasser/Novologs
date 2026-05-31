using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class TaskStatus(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{ 
    public TaskStatus() : this(Guid.NewGuid()) { }
    

    public ProjectTaskStatus Status { get; set; }
    
    public string? Color { get; set; }
    
    public Guid NameId { get; set; }
    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; }
}
