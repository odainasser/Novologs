using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Localizables.Commands.UpdateLocalizable;

public record UpdateLocalizableCommand : IRequest<Result<UpdateLocalizableResponse>>
{
    public Guid Id { get; set; }
    public string Value { get; set; } = null!;
    public ICollection<LocalizedStringDto> LocalizedStrings { get; set; } = new HashSet<LocalizedStringDto>();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateLocalizableCommand, Domain.Entities.LocalizableText>();
        }
    }
}

public class UpdateLocalizableResponse
{
}

public class UpdateLocalizableCommandValidator : AbstractValidator<UpdateLocalizableCommand>
{
    public UpdateLocalizableCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id).NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Value).NotEmpty().WithMessage("Value is required.");
    }
}

public class
    UpdateLocalizableCommandHandler : IRequestHandler<UpdateLocalizableCommand, Result<UpdateLocalizableResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateLocalizableCommandHandler(
        ITenantDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateLocalizableResponse>> Handle(UpdateLocalizableCommand request,
        CancellationToken cancellationToken)
    {
        var localizable = await _context.GetSet<Domain.Entities.LocalizableText>()
            .Include(l => l.LocalizedStrings)
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken: cancellationToken);
        if (localizable == null)
        {
            return Result<UpdateLocalizableResponse>.Failure("Localizable_001", "Localizable not found.");
        }

        _mapper.Map(request, localizable);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdateLocalizableResponse>.Success(new UpdateLocalizableResponse());
    }
}
