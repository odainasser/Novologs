using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class Product : BaseDeletableAuditableEntity<int>
{
    public Product(int id) : base(id)
    {
    }

    public Guid NameId { get; set; }
    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; }
    public string? Description { get; set; }
    public string? Unit { get; set; }
    public decimal? TaxPercentage { get; set; }
    public bool IsActive { get; set; } = true;
}
