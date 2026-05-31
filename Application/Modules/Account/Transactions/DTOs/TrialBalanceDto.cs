namespace Novologs.Application.Modules.Account.Transactions.DTOs;

public class TrialBalanceItemDto
{
    public Guid AccountId { get; set; }
    public string AccountCode { get; set; } = default!;
    public string AccountName { get; set; } = default!;
    public decimal DebitTotal { get; set; }
    public decimal CreditTotal { get; set; }
    public decimal Balance => DebitTotal - CreditTotal;
}

public class TrialBalanceDto
{
    public DateTime AsOf { get; set; }
    public List<TrialBalanceItemDto> Items { get; set; } = new();
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }
}
