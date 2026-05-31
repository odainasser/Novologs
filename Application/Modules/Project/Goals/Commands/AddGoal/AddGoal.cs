using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Goals.Commands.AddGoal;

public record AddGoalCommand : IRequest<Result<AddGoalResponse>>
{
    public LocalizableTextInputDto? Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddGoalCommand, Novologs.Domain.Entities.ProjectGoal>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
            ;
        }
    }
}

public class AddGoalResponse
{
    public Guid Id { get; set; }
}

public class AddGoalCommandValidator : AbstractValidator<AddGoalCommand>
{
    public AddGoalCommandValidator(ITenantDbContext context)
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
                return !await context.GetSet<ProjectGoal>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() && c.NameId != name.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class AddGoalCommandHandler : IRequestHandler<AddGoalCommand, Result<AddGoalResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddGoalCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AddGoalResponse>> Handle(AddGoalCommand request, CancellationToken cancellationToken)
    {
        var projectGoal = _mapper.Map<ProjectGoal>(request);
        await _context.GetSet<ProjectGoal>().AddAsync(projectGoal, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddGoalResponse>.Success(new AddGoalResponse() { Id = projectGoal.Id });
    }
}
