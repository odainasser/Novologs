using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ProjectTaskType(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{ 
    public ProjectTaskType() : this(Guid.NewGuid()) { }
    

    public Guid NameId { get; set; }
    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; } 
    
    public IEnumerable<ProjectTaskTypeProject>? Projects { get; set; } = new List<ProjectTaskTypeProject>();

}
