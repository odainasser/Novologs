using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Initiatives.Commands.UpdateInitiative;

public record UpdateInitiativeCommand : IRequest<Result<UpdateInitiativeResponse>>
{
    public Guid Id { get; set; }
    public LocalizableTextInputDto? Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateInitiativeCommand, Novologs.Domain.Entities.ProjectInitiative>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class UpdateInitiativeResponse
{
}

public class UpdateInitiativeCommandValidator : AbstractValidator<UpdateInitiativeCommand>
{
    public UpdateInitiativeCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
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

public class UpdateInitiativeCommandHandler : IRequestHandler<UpdateInitiativeCommand, Result<UpdateInitiativeResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateInitiativeCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateInitiativeResponse>> Handle(UpdateInitiativeCommand request,
        CancellationToken cancellationToken)
    {
        var projectInitiative = await _context.GetSet<ProjectInitiative>().FindAsync(request.Id);
        if (projectInitiative == null)
        {
            return Result<UpdateInitiativeResponse>.Failure("Initiative_001", "Initiative not found.");
        }

        _mapper.Map(request, projectInitiative);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdateInitiativeResponse>.Success(new UpdateInitiativeResponse());
    }
}
