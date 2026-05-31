using Novologs.Domain.Enums;

namespace Novologs.Domain.Entities;

public class PurchaseInvoiceItem
{
    public int Id { get; set; }
    public int PurchaseInvoiceId { get; set; }
    public int ProductId { get; set; }
    public string? Unit { get; set; }

    // Input fields
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public DiscountType LineDiscountType { get; set; } = DiscountType.Percentage;
    public decimal LineDiscountValue { get; set; } = 0;
    public decimal TaxPercent { get; set; } = 0;

    // Calculated and stored (Step 1-3)
    public decimal LineBase { get; set; }
    public decimal LineDiscountAmount { get; set; }
    public decimal TaxableAmount { get; set; }

    // Calculated and stored (Step 4-9)
    public decimal AllocatedOverallDiscount { get; set; }
    public decimal FinalTaxableAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal LineTotal { get; set; }

    // Navigation
    public PurchaseInvoice PurchaseInvoice { get; set; } = default!;
    public Product Product { get; set; } = default!;
}
