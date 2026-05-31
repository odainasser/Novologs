using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class VendorContractStatus(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public VendorContractStatus() : this(Guid.NewGuid()) { }
    public Guid NameId { get; set; }
    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; }
    public ICollection<VendorContract> VendorContracts { get; set; } = new HashSet<VendorContract>();
}
