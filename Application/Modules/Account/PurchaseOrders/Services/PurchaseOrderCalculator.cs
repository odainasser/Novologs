using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.PurchaseOrders.Services;

public static class PurchaseOrderCalculator
{
    public record ItemInput(
        decimal Quantity,
        decimal UnitPrice,
        DiscountType LineDiscountType,
        decimal LineDiscountValue,
        decimal TaxPercent);

    public record ItemResult(
        decimal LineBase,
        decimal LineDiscountAmount,
        decimal TaxableAmount,
        decimal AllocatedOverallDiscount,
        decimal FinalTaxableAmount,
        decimal TaxAmount,
        decimal LineTotal);

    public record SummaryResult(
        decimal Subtotal,
        decimal TotalLineDiscount,
        decimal SubtotalAfterLineDiscounts,
        decimal OverallDiscountAmount,
        decimal TotalTaxableAmount,
        decimal TotalTax,
        decimal GrandTotal,
        IReadOnlyList<ItemResult> Items);

    /// <summary>
    /// Calculates all PO values following the strict order:
    /// 1. LineBase = Qty × UnitPrice
    /// 2. LineDiscountAmount
    /// 3. TaxableAmount = LineBase − LineDiscountAmount
    /// 4. Subtotals
    /// 5. OverallDiscountAmount → distribute proportionally by LineBase
    /// 6. FinalTaxableAmount = TaxableAmount − AllocatedOverallDiscount
    /// 7. TaxAmount = FinalTaxableAmount × TaxPercent (per item)
    /// 8. LineTotal = FinalTaxableAmount + TaxAmount
    /// 9. Grand totals
    /// </summary>
    public static SummaryResult Calculate(
        IReadOnlyList<ItemInput> items,
        DiscountType overallDiscountType,
        decimal overallDiscountValue)
    {
        if (items.Count == 0)
        {
            return new SummaryResult(0, 0, 0, 0, 0, 0, 0, Array.Empty<ItemResult>());
        }

        // Step 1-3: Per-item base calculations
        var partials = items.Select(item =>
        {
            var lineBase = item.Quantity * item.UnitPrice;

            var lineDiscountAmount = item.LineDiscountType == DiscountType.Percentage
                ? lineBase * (item.LineDiscountValue / 100m)
                : item.LineDiscountValue;

            var taxableAmount = lineBase - lineDiscountAmount;

            return (lineBase, lineDiscountAmount, taxableAmount);
        }).ToList();

        // Step 4: Subtotals
        var subtotal                   = partials.Sum(p => p.lineBase);
        var totalLineDiscount          = partials.Sum(p => p.lineDiscountAmount);
        var subtotalAfterLineDiscounts = subtotal - totalLineDiscount;

        // Step 5: Overall discount amount
        var overallDiscountAmount = overallDiscountType == DiscountType.Percentage
            ? subtotalAfterLineDiscounts * (overallDiscountValue / 100m)
            : overallDiscountValue;

        // Step 6-8: Final per-item calculations
        var itemResults = partials.Select((p, i) =>
        {
            var item = items[i];

            // Distribute overall discount proportionally by LineBase share
            var allocatedOverallDiscount = subtotal > 0
                ? overallDiscountAmount * (p.lineBase / subtotal)
                : 0m;

            var finalTaxableAmount = p.taxableAmount - allocatedOverallDiscount;

            var taxAmount = finalTaxableAmount * (item.TaxPercent / 100m);
            var lineTotal = finalTaxableAmount + taxAmount;

            return new ItemResult(
                p.lineBase,
                p.lineDiscountAmount,
                p.taxableAmount,
                allocatedOverallDiscount,
                finalTaxableAmount,
                taxAmount,
                lineTotal);
        }).ToList();

        // Step 9: Grand totals
        var totalTaxableAmount = itemResults.Sum(r => r.FinalTaxableAmount);
        var totalTax           = itemResults.Sum(r => r.TaxAmount);
        var grandTotal         = totalTaxableAmount + totalTax;

        return new SummaryResult(
            subtotal,
            totalLineDiscount,
            subtotalAfterLineDiscounts,
            overallDiscountAmount,
            totalTaxableAmount,
            totalTax,
            grandTotal,
            itemResults.AsReadOnly());
    }
}
