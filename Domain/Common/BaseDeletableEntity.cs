using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Novologs.Domain.Common;

public abstract class BaseDeletableEntity : BaseEntity, ISoftDeletable
{
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedOnDate { get; set; } = null;
    public string? DeletedBy { get; set; } = null;
}

public abstract partial class BaseDeletableEntity<TId> : BaseDeletableEntity
{
    private readonly List<BaseEvent> _domainEvents = new();

    public BaseDeletableEntity(TId id)
    {
        Id = id;
    }

    [Key] public new TId Id { get; set; }

    [NotMapped] public override IReadOnlyCollection<BaseEvent> DomainEvents => _domainEvents.AsReadOnly();

    public override void AddDomainEvent(BaseEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public override void RemoveDomainEvent(BaseEvent domainEvent)
    {
        _domainEvents.Remove(domainEvent);
    }

    public override void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}