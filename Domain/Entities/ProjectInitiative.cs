using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ProjectInitiative(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{ 
    public ProjectInitiative() : this(Guid.NewGuid()) { }
    

    public Guid NameId { get; set; }
    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; }
    
    public List<Project> Projects { get; set; } = new();
}
