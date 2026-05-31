using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ProjectTaskTypeProject(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public ProjectTaskTypeProject() : this(Guid.NewGuid()) { }
    public Guid ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))] public Project? Project { get; set; }

    public Guid ProjectTaskTypeId { get; set; }
    [ForeignKey(nameof(ProjectTaskTypeId))] public ProjectTaskType? ProjectTaskType { get; set; }
}
