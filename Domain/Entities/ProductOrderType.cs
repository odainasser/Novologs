using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ProductOrderType(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public ProductOrderType() : this(Guid.NewGuid()) { }

    public Guid NameId { get; set; }
    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; }
}
