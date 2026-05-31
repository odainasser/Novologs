using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ProjectModule(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public ProjectModule() : this(Guid.NewGuid()) { }
    
    public Guid NameId { get; set; }
    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; }


    public Guid ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))] public Project? Project { get; set; }
}
