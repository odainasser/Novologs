using Novologs.Domain.Common;
using Novologs.Domain.Enums;

namespace Novologs.Domain.Entities;

public class Account : BaseDeletableAuditableEntity<Guid>
{
    public Account(Guid id) : base(id)
    {
    }

    public string Code { get; set; } = default!;
    public string Name { get; set; } = default!;
    public AccountType AccountType { get; set; }
    public AccountCategory AccountCategory { get; set; }
    public int Level { get; set; } = 1;
    public Guid? ParentAccountId { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsSubcategory { get; set; } = false;

    /// <summary>Opening balance debit amount (stored directly for fast chart-of-accounts display).</summary>
    public decimal OpeningDebit { get; set; } = 0;

    /// <summary>Opening balance credit amount (stored directly for fast chart-of-accounts display).</summary>
    public decimal OpeningCredit { get; set; } = 0;

    // Navigation properties
    public Account? ParentAccount { get; set; }
    public ICollection<Account> ChildAccounts { get; set; } = new List<Account>();
}
