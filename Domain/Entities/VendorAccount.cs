using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

/// <summary>
/// Links a <see cref="Vendor"/> to its General Ledger <see cref="Account"/>
/// under the Trade Debtors hierarchy in the chart of accounts.
/// Kept as a separate table so neither Vendor nor Account carries a FK to the other.
/// </summary>
public class VendorAccount(Guid id) : BaseEntity<Guid>(id)
{
    public Guid VendorId { get; set; }
    [ForeignKey(nameof(VendorId))] public Vendor? Vendor { get; set; }

    public Guid AccountId { get; set; }
    [ForeignKey(nameof(AccountId))] public Account? Account { get; set; }
}
