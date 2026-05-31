using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class UserWorkStatus(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public UserWorkStatus() : this(Guid.NewGuid()) { }

    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))] public TenantUser? User { get; set; }

    public Guid? WorkStatusId { get; set; }
    [ForeignKey(nameof(WorkStatusId))] public WorkStatus? WorkStatus { get; set; }

    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
}
