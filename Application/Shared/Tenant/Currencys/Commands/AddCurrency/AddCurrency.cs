using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Currencys.Commands.AddCurrency;

public record AddCurrencyCommand : IRequest<Result<AddCurrencyResponse>>
{
    public LocalizableTextDto Name { get; set; } = null!;
    public string Symbol { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddCurrencyCommand, Currency>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Symbol, opt => opt.MapFrom(src => src.Symbol));
        }
    }
}

public class AddCurrencyResponse
{
    public Guid Id { get; set; }
}

public class AddCurrencyCommandValidator : AbstractValidator<AddCurrencyCommand>
{
    public AddCurrencyCommandValidator(ITenantDbContext context)
    {
    
        RuleFor(v => v.Name)
            .NotNull().WithMessage("Name is required.");
        RuleFor(v => v.Name!.Value)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");
        RuleFor(v => v.Name)
            .MustAsync(async (name, cancellationToken) =>
            {
                if (name == null) return true;
                return !await context.GetSet<Currency>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() && c.NameId != name.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");
        RuleFor(v => v.Symbol)
            .NotEmpty().WithMessage("Symbol is required.")
            .MaximumLength(10).WithMessage("Symbol must not exceed 10 characters.");
        RuleFor(v => v.Symbol)
            .MustAsync(async (symbol, cancellationToken) =>
            {
                return !await context.GetSet<Currency>()
                    .AnyAsync(c => c.Symbol.Trim().ToLower() == symbol.Trim().ToLower(), cancellationToken);
            }).WithMessage("Symbol already used.");
    }
}

public class AddCurrencyCommandHandler : IRequestHandler<AddCurrencyCommand, Result<AddCurrencyResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddCurrencyCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AddCurrencyResponse>> Handle(AddCurrencyCommand request,
        CancellationToken cancellationToken)
    {
        var currency = _mapper.Map<Currency>(request);
        await _context.GetSet<Currency>()
            .AddAsync(currency, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddCurrencyResponse>.Success(
            new AddCurrencyResponse() { Id = currency.Id });
    }
}
