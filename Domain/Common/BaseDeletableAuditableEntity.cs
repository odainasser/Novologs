namespace Novologs.Domain.Common;

public abstract class BaseDeletableAuditableEntity<TId> : BaseDeletableEntity<TId>, IBaseAuditableEntity
{
    public BaseDeletableAuditableEntity(TId id) : base(id)
    {
    }

    public DateTimeOffset Created { get; set; }= DateTimeOffset.UtcNow;

    public string? CreatedBy { get; set; }

    public DateTimeOffset LastModified { get; set; }

    public string? LastModifiedBy { get; set; }
}