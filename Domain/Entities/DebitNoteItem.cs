using Novologs.Domain.Enums;

namespace Novologs.Domain.Entities;

public class DebitNoteItem
{
    public int Id { get; set; }
    public int DebitNoteId { get; set; }
    public int ProductId { get; set; }
    public string? Unit { get; set; }

    // Input fields
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public DiscountType LineDiscountType { get; set; } = DiscountType.Percentage;
    public decimal LineDiscountValue { get; set; } = 0;
    public decimal TaxPercent { get; set; } = 0;

    // Calculated fields (stored)
    public decimal LineBase { get; set; }
    public decimal LineDiscountAmount { get; set; }
    public decimal TaxableAmount { get; set; }
    public decimal AllocatedOverallDiscount { get; set; }
    public decimal FinalTaxableAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal LineTotal { get; set; }

    // Navigation
    public DebitNote DebitNote { get; set; } = default!;
    public Product Product { get; set; } = default!;
}
