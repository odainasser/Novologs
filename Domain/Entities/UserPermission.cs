using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class UserPermission(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public UserPermission() : this(Guid.NewGuid()) { }

    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))] public TenantUser User { get; set; } = null!;

    public Guid PermissionId { get; set; }
    [ForeignKey(nameof(PermissionId))] public Permission Permission { get; set; } = null!;
}
