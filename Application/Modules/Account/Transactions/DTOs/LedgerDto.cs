namespace Novologs.Application.Modules.Account.Transactions.DTOs;

public class LedgerEntryDto
{
    public int TransactionId { get; set; }
    public DateTime Date { get; set; }
    public string? ReferenceNo { get; set; }
    public string Description { get; set; } = default!;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public decimal RunningBalance { get; set; }
}

public class LedgerDto
{
    public Guid AccountId { get; set; }
    public string AccountCode { get; set; } = default!;
    public string AccountName { get; set; } = default!;
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal ClosingBalance { get; set; }
    public List<LedgerEntryDto> Entries { get; set; } = new();
}
