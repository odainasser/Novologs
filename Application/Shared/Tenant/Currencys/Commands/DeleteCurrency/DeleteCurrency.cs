using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Currencys.Commands.DeleteCurrency;

public record DeleteCurrencyCommand : IRequest<Result<DeleteCurrencyResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteCurrencyResponse
{
}

public class DeleteCurrencyCommandValidator : AbstractValidator<DeleteCurrencyCommand>
{
    public DeleteCurrencyCommandValidator(ITenantDbContext context)
    {
    
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Currency>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Currency not found.");
    }
}

public class DeleteCurrencyCommandHandler : IRequestHandler<DeleteCurrencyCommand, Result<DeleteCurrencyResponse>>
{
    private readonly ITenantDbContext _context;

    public DeleteCurrencyCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DeleteCurrencyResponse>> Handle(DeleteCurrencyCommand request,
        CancellationToken cancellationToken)
    {
        var currency = await _context.GetSet<Currency>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (currency == null)
        {
            return Result<DeleteCurrencyResponse>.Failure("Currency_003", "Currency not found");
        }

        _context.GetSet<Currency>().Remove(currency);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteCurrencyResponse>.Success(new DeleteCurrencyResponse());
    }
}
