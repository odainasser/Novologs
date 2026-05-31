using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Currencys.Commands.UpdateCurrency;

public record UpdateCurrencyCommand : IRequest<Result<UpdateCurrencyResponse>>
{
    public Guid Id { get; set; }
    public LocalizableTextDto Name { get; set; } = null!;
    public string Symbol { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateCurrencyCommand, Currency>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Symbol, opt => opt.MapFrom(src => src.Symbol));
        }
    }
}

public class UpdateCurrencyResponse
{
}

public class UpdateCurrencyCommandValidator : AbstractValidator<UpdateCurrencyCommand>
{
    public UpdateCurrencyCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Currency>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Currency not found.");
        RuleFor(v => v.Name)
            .NotNull().WithMessage("Name is required.");
        RuleFor(v => v.Name!.Value)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");
        RuleFor(v => v.Name)
            .MustAsync(async (command, name, cancellationToken) =>
            {
                if (name == null) return true;
                return !await context.GetSet<Currency>()
                    .AnyAsync(
                        c => c.Name.Value.Trim().ToLower() == command.Name.Value.Trim().ToLower() &&
                             c.Id != command.Id &&
                             c.NameId != name.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");
        RuleFor(v => v.Symbol)
            .NotEmpty().WithMessage("Symbol is required.")
            .MaximumLength(10).WithMessage("Symbol must not exceed 10 characters.");
        RuleFor(v => v.Symbol)
            .MustAsync(async (command, symbol1, cancellationToken) =>
            {
                return !await context.GetSet<Currency>()
                    .AnyAsync(c => c.Symbol.Trim().ToLower() == command.Symbol.Trim().ToLower() && c.Id != command.Id,
                        cancellationToken);
            }).WithMessage("Symbol already used.");
    }
}

public class UpdateCurrencyCommandHandler : IRequestHandler<UpdateCurrencyCommand, Result<UpdateCurrencyResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateCurrencyCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateCurrencyResponse>> Handle(UpdateCurrencyCommand request,
        CancellationToken cancellationToken)
    {
        var currency = await _context.GetSet<Currency>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (currency == null)
        {
            return Result<UpdateCurrencyResponse>.Failure("Currency_001", "Currency not found.");
        }

        _mapper.Map(request, currency);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdateCurrencyResponse>.Success(new UpdateCurrencyResponse());
    }
}
