using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.SalesInvoices.DTOs;

public class SalesInvoiceDto
{
    public int Id { get; set; }
    public string InvNumber { get; set; } = default!;
    public Guid ClientId { get; set; }
    public string Currency { get; set; } = default!;
    public InvoiceType InvoiceType { get; set; }
    public string? BillingAddress { get; set; }
    public string? Location { get; set; }
    public string? Terms { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string? OurRef { get; set; }
    public string? YourRef { get; set; }
    public string? MessageOnInvoice { get; set; }
    public Guid DebitAccountId { get; set; }
    public Guid CreditAccountId { get; set; }
    public DiscountType OverallDiscountType { get; set; }
    public decimal OverallDiscountValue { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TotalLineDiscount { get; set; }
    public decimal SubtotalAfterLineDiscounts { get; set; }
    public decimal OverallDiscountAmount { get; set; }
    public decimal TotalTaxableAmount { get; set; }
    public decimal TotalTax { get; set; }
    public decimal GrandTotal { get; set; }
    public SalesInvoiceStatus Status { get; set; }
    public int? AccountTransactionId { get; set; }
    public DateTimeOffset Created { get; set; }
    public UserSummaryDto? CreatedByUser { get; set; }
    public ClientSummaryDto? Client { get; set; }
    public List<SalesInvoiceItemDto> Items { get; set; } = new();
    public List<SalesInvoiceAttachmentDto> Attachments { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.SalesInvoice, SalesInvoiceDto>()
                .ForMember(d => d.CreatedByUser, opt => opt.Ignore())
                .ForMember(d => d.Client, opt => opt.Ignore());
        }
    }
}
