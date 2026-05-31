using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ProjectMember(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public ProjectMember() : this(Guid.NewGuid()) { }

    public bool isOwner { get; set; } = false;
    public Guid ProjectId { get; set; }
    [ForeignKey(nameof(ProjectId))] public Project Project { get; set; } = null!;

    public Guid MemberId { get; set; }
    [ForeignKey(nameof(MemberId))] public TenantUser Member { get; set; } = null!;
}
