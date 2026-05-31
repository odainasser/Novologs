using FluentValidation;

namespace Novologs.Application.Modules.Account.PurchaseInvoices.Commands.CreatePurchaseInvoice;

public class CreatePurchaseInvoiceCommandValidator : AbstractValidator<CreatePurchaseInvoiceCommand>
{
    public CreatePurchaseInvoiceCommandValidator()
    {
        RuleFor(x => x.VendorId)
            .NotEmpty().WithMessage("VendorId is required.");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required.")
            .MaximumLength(10);

        RuleFor(x => x.InvoiceDate)
            .NotEmpty().WithMessage("InvoiceDate is required.");

        RuleFor(x => x.DebitAccountId)
            .NotEmpty().WithMessage("DebitAccountId is required.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("At least one line item is required.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).GreaterThan(0).WithMessage("ProductId is required on each item.");
            item.RuleFor(i => i.Quantity).GreaterThan(0).WithMessage("Quantity must be greater than zero.");
            item.RuleFor(i => i.UnitPrice).GreaterThanOrEqualTo(0).WithMessage("UnitPrice must be non-negative.");
        });
    }
}
