namespace Novologs.Application.Modules.Account.Transactions.Commands.CreateTransaction;

public class CreateTransactionCommandValidator : AbstractValidator<CreateTransactionCommand>
{
    public CreateTransactionCommandValidator()
    {
        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Transaction date is required.");

        RuleFor(x => x.ReferenceNo)
            .MaximumLength(50).WithMessage("Reference number must not exceed 50 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");

        RuleFor(x => x.Lines)
            .NotEmpty().WithMessage("At least one line is required.")
            .Must(l => l.Count >= 2).WithMessage("A transaction must have at least 2 lines.");

        RuleForEach(x => x.Lines).ChildRules(line =>
        {
            line.RuleFor(l => l.AccountId)
                .NotEmpty().WithMessage("Account ID is required.");

            line.RuleFor(l => l.Debit)
                .GreaterThanOrEqualTo(0).WithMessage("Debit cannot be negative.");

            line.RuleFor(l => l.Credit)
                .GreaterThanOrEqualTo(0).WithMessage("Credit cannot be negative.");
        });
    }
}
