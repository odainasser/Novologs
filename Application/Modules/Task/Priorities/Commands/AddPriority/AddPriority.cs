using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Tasks.Priorities.Commands.AddPriority;

public record AddPriorityCommand : IRequest<Result<AddPriorityResponse>>
{
    public LocalizableTextInputDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddPriorityCommand, Novologs.Domain.Entities.TaskPriority>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class AddPriorityResponse
{
}

public class AddPriorityCommandValidator : AbstractValidator<AddPriorityCommand>
{
    public AddPriorityCommandValidator(ITenantDbContext context)
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
                return !await context.GetSet<Novologs.Domain.Entities.TaskPriority>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() ,
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class AddPriorityCommandHandler : IRequestHandler<AddPriorityCommand, Result<AddPriorityResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddPriorityCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AddPriorityResponse>> Handle(AddPriorityCommand request,
        CancellationToken cancellationToken)
    {
        var priority = _mapper.Map<Novologs.Domain.Entities.TaskPriority>(request);
        await _context.GetSet<Novologs.Domain.Entities.TaskPriority>().AddAsync(priority, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddPriorityResponse>.Success(new AddPriorityResponse());
    }
}
