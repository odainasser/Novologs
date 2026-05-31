namespace Novologs.Application.Modules.Account.Products.Commands.CreateProduct;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotNull().WithMessage("Product name is required.");

        RuleFor(x => x.Name.Value)
            .NotEmpty().WithMessage("Product name value is required.")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");

        RuleFor(x => x.Unit)
            .MaximumLength(50).WithMessage("Unit must not exceed 50 characters.");

        RuleFor(x => x.TaxPercentage)
            .InclusiveBetween(0, 100).When(x => x.TaxPercentage.HasValue)
            .WithMessage("Tax percentage must be between 0 and 100.");
    }
}
