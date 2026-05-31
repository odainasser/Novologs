using Novologs.Domain.Common;
using Novologs.Domain.Enums;

namespace Novologs.Domain.Entities;

public class InvoiceDefaultAccount : BaseDeletableAuditableEntity<Guid>
{
    public InvoiceDefaultAccount(Guid id) : base(id) { }
    public InvoiceDefaultAccount() : this(Guid.NewGuid()) { }

    public InvoiceCategory InvoiceCategory { get; set; }
    public InvoiceAccountRole InvoiceAccountRole { get; set; }

    public Guid AccountId { get; set; }

    // Navigation
    public Account Account { get; set; } = default!;
}
