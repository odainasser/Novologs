using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ProjectMileStone(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public ProjectMileStone() : this(Guid.NewGuid()) { }

    public Guid ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))] public Project? Project { get; set; }

    [MaxLength(2048)] public string Name { get; set; } = null!;

    [MaxLength(2048 * 4)] public string Description { get; set; } = null!;

    public Guid? DocumentId { get; set; }
    [ForeignKey(nameof(DocumentId))] public DocumentNode? Document { get; set; }

    //public List<ProjectTask> Tasks { get; set; } = new();

    public DateTime StartDate { get; set; }
    public DateTime DueDate { get; set; }
}
