using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.PurchaseOrders.Commands.CreatePurchaseOrder;

public class CreatePurchaseOrderCommandValidator : AbstractValidator<CreatePurchaseOrderCommand>
{
    public CreatePurchaseOrderCommandValidator()
    {
        RuleFor(x => x.VendorId)
            .NotEmpty().WithMessage("Vendor ID is required.");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required.")
            .MaximumLength(10).WithMessage("Currency code must not exceed 10 characters.");

        RuleFor(x => x.PurchaseDate)
            .NotEmpty().WithMessage("Purchase date is required.");

        RuleFor(x => x.BillingAddress)
            .MaximumLength(500).WithMessage("Billing address must not exceed 500 characters.");

        RuleFor(x => x.OrderType)
            .MaximumLength(100).WithMessage("Order type must not exceed 100 characters.");

        RuleFor(x => x.Location)
            .MaximumLength(200).WithMessage("Location must not exceed 200 characters.");

        RuleFor(x => x.Terms)
            .MaximumLength(500).WithMessage("Terms must not exceed 500 characters.");

        RuleFor(x => x.OurRef)
            .MaximumLength(100).WithMessage("Our Ref must not exceed 100 characters.");

        RuleFor(x => x.YourRef)
            .MaximumLength(100).WithMessage("Your Ref must not exceed 100 characters.");

        RuleFor(x => x.OverallDiscountValue)
            .GreaterThanOrEqualTo(0).WithMessage("Overall discount value cannot be negative.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one item is required.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId)
                .GreaterThan(0).WithMessage("Product ID is required.");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("Quantity must be greater than zero.");

            item.RuleFor(i => i.UnitPrice)
                .GreaterThanOrEqualTo(0).WithMessage("Unit price cannot be negative.");

            item.RuleFor(i => i.LineDiscountValue)
                .GreaterThanOrEqualTo(0).WithMessage("Line discount value cannot be negative.");

            item.When(i => i.LineDiscountType == DiscountType.Percentage, () =>
            {
                item.RuleFor(i => i.LineDiscountPercent)
                    .GreaterThanOrEqualTo(0).WithMessage("Line discount percentage cannot be negative.")
                    .LessThanOrEqualTo(100).WithMessage("Line discount percentage cannot exceed 100%.");
            });

            item.RuleFor(i => i.TaxPercent)
                .GreaterThanOrEqualTo(0).WithMessage("Tax percent cannot be negative.")
                .LessThanOrEqualTo(100).WithMessage("Tax percent cannot exceed 100%.");

            item.RuleFor(i => i.Unit!.Value)
                .MaximumLength(50).WithMessage("Unit must not exceed 50 characters.")
                .When(i => i.Unit != null);
        });
    }
}
