using Novologs.Domain.Common;
using Novologs.Domain.Enums;

namespace Novologs.Domain.Entities;

public class SalesInvoice : BaseDeletableAuditableEntity<int>
{
    public SalesInvoice(int id) : base(id)
    {
    }

    // Header
    public string InvNumber { get; set; } = default!;
    public Guid ClientId { get; set; }
    public string Currency { get; set; } = default!;
    public InvoiceType InvoiceType { get; set; } = InvoiceType.TaxCashInvoice;
    public string? BillingAddress { get; set; }
    public string? Location { get; set; }
    public string? Terms { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string? OurRef { get; set; }
    public string? YourRef { get; set; }
    public string? MessageOnInvoice { get; set; }

    // GL Accounts
    public Guid DebitAccountId { get; set; }
    public Guid CreditAccountId { get; set; }

    // Overall discount
    public DiscountType OverallDiscountType { get; set; } = DiscountType.Percentage;
    public decimal OverallDiscountValue { get; set; } = 0;

    // Stored summary (calculated and persisted)
    public decimal Subtotal { get; set; } = 0;
    public decimal TotalLineDiscount { get; set; } = 0;
    public decimal SubtotalAfterLineDiscounts { get; set; } = 0;
    public decimal OverallDiscountAmount { get; set; } = 0;
    public decimal TotalTaxableAmount { get; set; } = 0;
    public decimal TotalTax { get; set; } = 0;
    public decimal GrandTotal { get; set; } = 0;

    // Status and posting
    public SalesInvoiceStatus Status { get; set; } = SalesInvoiceStatus.Draft;
    public int? AccountTransactionId { get; set; }

    // Navigation
    public ICollection<SalesInvoiceItem> Items { get; set; } = new List<SalesInvoiceItem>();
    public ICollection<SalesInvoiceAttachment> Attachments { get; set; } = new List<SalesInvoiceAttachment>();
}
