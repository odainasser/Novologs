using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Goals.Commands.UpdateGoal;

public record UpdateGoalCommand : IRequest<Result<UpdateGoalResponse>>
{
    public Guid Id { get; set; }
    public LocalizableTextInputDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateGoalCommand, Novologs.Domain.Entities.ProjectGoal>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class UpdateGoalResponse
{
}

public class UpdateGoalCommandValidator : AbstractValidator<UpdateGoalCommand>
{
    public UpdateGoalCommandValidator(ITenantDbContext context)
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
                return !await context.GetSet<ProjectGoal>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() && c.NameId != name.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class UpdateGoalCommandHandler : IRequestHandler<UpdateGoalCommand, Result<UpdateGoalResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateGoalCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateGoalResponse>> Handle(UpdateGoalCommand request, CancellationToken cancellationToken)
    {
        var projectGoal = await _context.GetSet<ProjectGoal>().FindAsync(request.Id);
        if (projectGoal == null)
        {
            return Result<UpdateGoalResponse>.Failure("Goal_001", "Goal not found.");
        }

        _mapper.Map(request, projectGoal);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdateGoalResponse>.Success(new UpdateGoalResponse());
    }
}
