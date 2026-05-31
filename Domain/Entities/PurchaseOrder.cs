using Novologs.Domain.Common;
using Novologs.Domain.Enums;

namespace Novologs.Domain.Entities;

public class PurchaseOrder : BaseDeletableAuditableEntity<int>
{
    public PurchaseOrder(int id) : base(id)
    {
    }

    // Header
    public string PoNumber { get; set; } = default!;
    public Guid VendorId { get; set; }
    public string Currency { get; set; } = default!;
    public string? BillingAddress { get; set; }
    public string? OrderType { get; set; }
    public string? Location { get; set; }
    public string? Terms { get; set; }
    public DateTime PurchaseDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string? OurRef { get; set; }
    public string? YourRef { get; set; }
    public PurchaseOrderStatus Status { get; set; } = PurchaseOrderStatus.Draft;
    public string? MessageOnPurchase { get; set; }

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

    // Navigation
    public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
    public ICollection<PurchaseOrderAttachment> Attachments { get; set; } = new List<PurchaseOrderAttachment>();
}
