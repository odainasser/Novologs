using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class RolePermission(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public RolePermission() : this(Guid.NewGuid()) { }

    public Guid RoleId { get; set; }
    [ForeignKey(nameof(RoleId))] public IdentityRole<Guid> Role { get; set; } = null!;

    public Guid PermissionId { get; set; }
    [ForeignKey(nameof(PermissionId))] public Permission Permission { get; set; } = null!;
}
