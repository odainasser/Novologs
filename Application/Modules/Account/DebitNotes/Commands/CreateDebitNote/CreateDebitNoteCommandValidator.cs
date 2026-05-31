using FluentValidation;

namespace Novologs.Application.Modules.Account.DebitNotes.Commands.CreateDebitNote;

public class CreateDebitNoteCommandValidator : AbstractValidator<CreateDebitNoteCommand>
{
    public CreateDebitNoteCommandValidator()
    {
        RuleFor(x => x.VendorId)
            .NotEmpty().WithMessage("VendorId is required.");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required.")
            .MaximumLength(10);

        RuleFor(x => x.NoteDate)
            .NotEmpty().WithMessage("NoteDate is required.");

        // When no source invoice is linked, accounts must be supplied
        When(x => !x.PurchaseInvoiceId.HasValue, () =>
        {
            RuleFor(x => x.DebitAccountId)
                .NotEmpty().WithMessage("DebitAccountId is required when no PurchaseInvoiceId is supplied.");

            RuleFor(x => x.CreditAccountId)
                .NotEmpty().WithMessage("CreditAccountId is required when no PurchaseInvoiceId is supplied.");
        });

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).GreaterThan(0).WithMessage("ProductId is required on each item.");
            item.RuleFor(i => i.Quantity).GreaterThan(0).WithMessage("Quantity must be greater than zero.");
            item.RuleFor(i => i.UnitPrice).GreaterThanOrEqualTo(0).WithMessage("UnitPrice must be non-negative.");
        });
    }
}
