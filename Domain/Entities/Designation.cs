using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class Designation(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public Designation() : this(Guid.NewGuid()) { }

    public Guid NameId { get; set; }

    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; }

    public ICollection<TenantUser> Employees { get; set; } = new HashSet<TenantUser>();
}
