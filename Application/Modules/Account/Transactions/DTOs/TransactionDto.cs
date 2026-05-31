namespace Novologs.Application.Modules.Account.Transactions.DTOs;

public class TransactionDto
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string? ReferenceNo { get; set; }
    public string Description { get; set; } = default!;
    public bool IsPosted { get; set; }
    public DateTime? PostedDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = default!;
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }
    public List<TransactionLineDto> Lines { get; set; } = new();
    public List<TransactionAttachmentDto> Attachments { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.AccountTransaction, TransactionDto>()
                .ForMember(d => d.TotalDebit,  opt => opt.MapFrom(s => s.Lines.Sum(l => l.Debit)))
                .ForMember(d => d.TotalCredit, opt => opt.MapFrom(s => s.Lines.Sum(l => l.Credit)));
        }
    }
}
