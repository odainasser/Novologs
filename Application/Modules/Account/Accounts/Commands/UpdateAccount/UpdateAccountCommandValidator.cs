namespace Novologs.Application.Modules.Account.Accounts.Commands.UpdateAccount;

public class UpdateAccountCommandValidator : AbstractValidator<UpdateAccountCommand>
{
    public UpdateAccountCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Account ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Account name is required.")
            .MaximumLength(200).WithMessage("Account name must not exceed 200 characters.");

        RuleFor(x => x.AccountType)
            .IsInEnum().When(x => x.AccountType.HasValue)
            .WithMessage("Invalid account type.");

        RuleFor(x => x. AccountCategory)
            .IsInEnum().When(x => x.AccountCategory.HasValue)
            .WithMessage("Invalid account category.");
    }
}
