using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class Permission(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public Permission() : this(Guid.NewGuid()) { }

    public string Name { get; set; } = null!;
    
    public string? Description { get; set; }
}
