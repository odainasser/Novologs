namespace Novologs.Domain.Entities;

public class AccountTransactionLine
{
    public int Id { get; set; }
    public int TransactionId { get; set; }
    public Guid AccountId { get; set; }
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public string? Description { get; set; }

    public AccountTransaction Transaction { get; set; } = default!;
    public Account Account { get; set; } = default!;
}
