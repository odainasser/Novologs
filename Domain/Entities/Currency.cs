using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class Currency(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{ 
    public Currency() : this(Guid.NewGuid()) { }
    
    public Guid NameId { get; set; }
    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; }
    [MaxLength(10)] public string Symbol { get; set; } = null!;
}
