using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ProjectTaskTimeLine(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public ProjectTaskTimeLine() : this(Guid.NewGuid()) { }

    public Guid ProjectTaskId { get; set; }
    [ForeignKey(nameof(ProjectTaskId))] public ProjectTask? ProjectTask { get; set; }

    public Guid CreatorId { get; set; }
    [ForeignKey(nameof(CreatorId))] public TenantUser? Creator { get; set; }

    public string Description { get; set; } = null!;

    public DateTime? Date { get; set; }
}
