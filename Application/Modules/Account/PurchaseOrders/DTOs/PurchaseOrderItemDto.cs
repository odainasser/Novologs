using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.PurchaseOrders.DTOs;

public class PurchaseOrderItemDto
{
    public int Id { get; set; }
    public ProductSummaryDto? Product { get; set; }
    public UnitSummaryDto? Unit { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public DiscountType LineDiscountType { get; set; }
    public decimal LineDiscountValue { get; set; }
    public decimal LineDiscountPercent { get; set; }
    public decimal TaxPercent { get; set; }
    public decimal LineBase { get; set; }
    public decimal LineDiscountAmount { get; set; }
    public decimal TaxableAmount { get; set; }
    public decimal AllocatedOverallDiscount { get; set; }
    public decimal FinalTaxableAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal LineTotal { get; set; }
}
