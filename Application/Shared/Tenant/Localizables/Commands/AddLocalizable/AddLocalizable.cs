using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Localizables.Commands.AddLocalizable;

public record AddLocalizableCommand : IRequest<Result<AddLocalizableResponse>>
{
    public string Value { get; set; } = null!;
    public ICollection<LocalizedStringDto> LocalizedStrings { get; set; } = new HashSet<LocalizedStringDto>();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddLocalizableCommand, Domain.Entities.LocalizableText>();
        }
    }
}

public class AddLocalizableResponse
{
    public Guid Id { get; set; }
}

public class AddLocalizableCommandValidator : AbstractValidator<AddLocalizableCommand>
{
    public AddLocalizableCommandValidator()
    {
        RuleFor(v => v.Value).NotEmpty().WithMessage("Value is required.");
    }
}

public class AddLocalizableCommandHandler : IRequestHandler<AddLocalizableCommand, Result<AddLocalizableResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddLocalizableCommandHandler(
        ITenantDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper; 
    }

    public async Task<Result<AddLocalizableResponse>> Handle(AddLocalizableCommand request,
        CancellationToken cancellationToken)
    {
        var localizable = _mapper.Map<Domain.Entities.LocalizableText>(request);
        await _context.GetSet<Domain.Entities.LocalizableText>().AddAsync(localizable, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddLocalizableResponse>.Success(new AddLocalizableResponse { Id = localizable.Id });
    }
}
