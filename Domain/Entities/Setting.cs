using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class Setting(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public Setting() : this(Guid.NewGuid()) { }

    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public string? Extra { get; set; } = null;
}
