namespace Novologs.Application.Modules.Account.Accounts.Commands.CreateAccount;

public class CreateAccountCommandValidator : AbstractValidator<CreateAccountCommand>
{
    public CreateAccountCommandValidator()
    {
        // Code is optional — if omitted the backend auto-generates it from the parent.
        // When provided it must not exceed 20 characters.
        When(x => !string.IsNullOrWhiteSpace(x.Code), () =>
        {
            RuleFor(x => x.Code)
                .MaximumLength(20).WithMessage("Account code must not exceed 20 characters.");
        });

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Account name is required.")
            .MaximumLength(200).WithMessage("Account name must not exceed 200 characters.");

        RuleFor(x => x.AccountType)
            .IsInEnum().WithMessage("Invalid account type.");

        RuleFor(x => x.AccountCategory)
            .IsInEnum().WithMessage("Invalid account category.");
    }
}
