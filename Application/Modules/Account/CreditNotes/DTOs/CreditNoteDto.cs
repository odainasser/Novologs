using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.CreditNotes.DTOs;

public class CreditNoteDto
{
    public int Id { get; set; }
    public string NoteNumber { get; set; } = default!;
    public Guid ClientId { get; set; }
    public string Currency { get; set; } = default!;
    public InvoiceType InvoiceType { get; set; }
    public string? BillingAddress { get; set; }
    public string? Location { get; set; }
    public string? Terms { get; set; }
    public DateTime NoteDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string? OurRef { get; set; }
    public string? YourRef { get; set; }
    public string? MessageOnNote { get; set; }
    public Guid DebitAccountId { get; set; }
    public Guid CreditAccountId { get; set; }
    public int? SalesInvoiceId { get; set; }
    public DiscountType OverallDiscountType { get; set; }
    public decimal OverallDiscountValue { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TotalLineDiscount { get; set; }
    public decimal SubtotalAfterLineDiscounts { get; set; }
    public decimal OverallDiscountAmount { get; set; }
    public decimal TotalTaxableAmount { get; set; }
    public decimal TotalTax { get; set; }
    public decimal GrandTotal { get; set; }
    public CreditNoteStatus Status { get; set; }
    public int? AccountTransactionId { get; set; }
    public DateTimeOffset Created { get; set; }
    public UserSummaryDto? CreatedByUser { get; set; }
    public ClientSummaryDto? Client { get; set; }
    public List<CreditNoteItemDto> Items { get; set; } = new();
    public List<CreditNoteAttachmentDto> Attachments { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.CreditNote, CreditNoteDto>()
                .ForMember(d => d.CreatedByUser, opt => opt.Ignore())
                .ForMember(d => d.Client, opt => opt.Ignore());
        }
    }
}
