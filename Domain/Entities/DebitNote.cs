using Novologs.Domain.Common;
using Novologs.Domain.Enums;

namespace Novologs.Domain.Entities;

public class DebitNote : BaseDeletableAuditableEntity<int>
{
    public DebitNote(int id) : base(id)
    {
    }

    // Header
    public string NoteNumber { get; set; } = default!;
    public Guid VendorId { get; set; }
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

    // GL Accounts (auto-reversed from PI when linked, or user-supplied)
    public Guid DebitAccountId { get; set; }
    public Guid CreditAccountId { get; set; }

    // Optional link to the source Purchase Invoice
    public int? PurchaseInvoiceId { get; set; }

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
    public DebitNoteStatus Status { get; set; } = DebitNoteStatus.Draft;
    public int? AccountTransactionId { get; set; }

    // Navigation
    public PurchaseInvoice? PurchaseInvoice { get; set; }
    public ICollection<DebitNoteItem> Items { get; set; } = new List<DebitNoteItem>();
    public ICollection<DebitNoteAttachment> Attachments { get; set; } = new List<DebitNoteAttachment>();
}
