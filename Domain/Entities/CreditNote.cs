using Novologs.Domain.Common;
using Novologs.Domain.Enums;

namespace Novologs.Domain.Entities;

public class CreditNote : BaseDeletableAuditableEntity<int>
{
    public CreditNote(int id) : base(id)
    {
    }

    // Header
    public string NoteNumber { get; set; } = default!;
    public Guid ClientId { get; set; }
    public string Currency { get; set; } = default!;
    public InvoiceType InvoiceType { get; set; } = InvoiceType.TaxCashInvoice;
    public string? BillingAddress { get; set; }
    public string? Location { get; set; }
    public string? Terms { get; set; }
    public DateTime NoteDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string? OurRef { get; set; }
    public string? YourRef { get; set; }
    public string? MessageOnNote { get; set; }

    // GL Accounts (auto-reversed from SI when linked, or user-supplied)
    public Guid DebitAccountId { get; set; }
    public Guid CreditAccountId { get; set; }

    // Optional link to the source Sales Invoice
    public int? SalesInvoiceId { get; set; }

    // Overall discount
    public DiscountType OverallDiscountType { get; set; } = DiscountType.Percentage;
    public decimal OverallDiscountValue { get; set; } = 0;

    // Calculated totals (persisted)
    public decimal Subtotal { get; set; } = 0;
    public decimal TotalLineDiscount { get; set; } = 0;
    public decimal SubtotalAfterLineDiscounts { get; set; } = 0;
    public decimal OverallDiscountAmount { get; set; } = 0;
    public decimal TotalTaxableAmount { get; set; } = 0;
    public decimal TotalTax { get; set; } = 0;
    public decimal GrandTotal { get; set; } = 0;

    // Status and journal link
    public CreditNoteStatus Status { get; set; } = CreditNoteStatus.Draft;
    public int? AccountTransactionId { get; set; }

    // Navigation
    public SalesInvoice? SalesInvoice { get; set; }
    public ICollection<CreditNoteItem> Items { get; set; } = new List<CreditNoteItem>();
    public ICollection<CreditNoteAttachment> Attachments { get; set; } = new List<CreditNoteAttachment>();
}
