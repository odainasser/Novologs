using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.Accounts.DTOs;

public class UpdateAccountDto
{
    public string Name { get; set; } = default!;
    public AccountType? AccountType { get; set; }
    public AccountCategory? AccountCategory { get; set; }
    public Guid? ParentAccountId { get; set; }
    public bool? IsActive { get; set; }
}
