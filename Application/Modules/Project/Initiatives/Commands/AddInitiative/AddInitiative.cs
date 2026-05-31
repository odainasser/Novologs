using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Initiatives.Commands.AddInitiative;

public record AddInitiativeCommand : IRequest<Result<AddInitiativeResponse>>
{
    public LocalizableTextInputDto? Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddInitiativeCommand, Novologs.Domain.Entities.ProjectInitiative>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
            ;
        }
    }
}

public class AddInitiativeResponse
{
    public Guid Id { get; set; }
}

public class AddInitiativeCommandValidator : AbstractValidator<AddInitiativeCommand>
{
    public AddInitiativeCommandValidator(ITenantDbContext context)
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
                return !await context.GetSet<ProjectInitiative>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() && c.NameId != name.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class AddInitiativeCommandHandler : IRequestHandler<AddInitiativeCommand, Result<AddInitiativeResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddInitiativeCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AddInitiativeResponse>> Handle(AddInitiativeCommand request,
        CancellationToken cancellationToken)
    {
        var projectInitiative = _mapper.Map<ProjectInitiative>(request);
        await _context.GetSet<ProjectInitiative>().AddAsync(projectInitiative, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddInitiativeResponse>.Success(new AddInitiativeResponse() { Id = projectInitiative.Id });
    }
}
