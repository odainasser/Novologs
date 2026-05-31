using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Client.Sources.Commands.AddSource;

public record AddSourceCommand : IRequest<Result<AddSourceResponse>>
{
    public LocalizableTextDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddSourceCommand, Novologs.Domain.Entities.LeadSource>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class AddSourceResponse
{
    public Guid Id { get; set; }
}

public class AddSourceCommandValidator : AbstractValidator<AddSourceCommand>
{
    public AddSourceCommandValidator(ITenantDbContext context)
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
                return !await context.GetSet<Novologs.Domain.Entities.LeadSource>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() && c.NameId != name.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class AddSourceCommandHandler : IRequestHandler<AddSourceCommand, Result<AddSourceResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddSourceCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AddSourceResponse>> Handle(AddSourceCommand request, CancellationToken cancellationToken)
    {
        var leadSource = _mapper.Map<Novologs.Domain.Entities.LeadSource>(request);
        await _context.GetSet<Novologs.Domain.Entities.LeadSource>()
            .AddAsync(leadSource, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddSourceResponse>.Success(
            new AddSourceResponse() { Id = leadSource.Id });
    }
}
