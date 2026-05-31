using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ProjectTaskMember(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public ProjectTaskMember() : this(Guid.NewGuid()) { }

    public Guid? StatusId { get; set; }
    [ForeignKey(nameof(StatusId))] public TaskStatus? Status { get; set; }

    public Guid? TaskId { get; set; }
    [ForeignKey(nameof(TaskId))] public ProjectTask? ProjectTask { get; set; }
    public Guid? MemberId { get; set; }
    [ForeignKey(nameof(MemberId))] public TenantUser? TenantUser { get; set; }

    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
}
