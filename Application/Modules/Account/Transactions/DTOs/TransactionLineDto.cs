namespace Novologs.Application.Modules.Account.Transactions.DTOs;

public class TransactionLineDto
{
    public int Id { get; set; }
    public Guid AccountId { get; set; }
    public string AccountCode { get; set; } = default!;
    public string AccountName { get; set; } = default!;
    /// <summary>Full ancestor path, e.g. "1000 - Assets > 1100 - Current Assets > 1110 - Cash"</summary>
    public string AccountPath { get; set; } = default!;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public string? Description { get; set; }

    internal static string BuildPath(Novologs.Domain.Entities.Account? account)
    {
        if (account is null) return string.Empty;

        var segments = new System.Collections.Generic.List<string>();
        var current = account;
        while (current is not null)
        {
            segments.Insert(0, $"{current.Code} - {current.Name}");
            current = current.ParentAccount;
        }
        return string.Join(" > ", segments);
    }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.AccountTransactionLine, TransactionLineDto>()
                .ForMember(d => d.AccountCode, opt => opt.MapFrom(s => s.Account != null ? s.Account.Code : string.Empty))
                .ForMember(d => d.AccountName, opt => opt.MapFrom(s => s.Account != null ? s.Account.Name : string.Empty))
                .ForMember(d => d.AccountPath, opt => opt.MapFrom(s => BuildPath(s.Account)));
        }
    }
}
