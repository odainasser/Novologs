using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Tasks.Priorities.Commands.UpdatePriority;

public record UpdatePriorityCommand : IRequest<Result<UpdatePriorityResponse>>
{
    public Guid Id { get; set; }
    public LocalizableTextInputDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdatePriorityCommand, Novologs.Domain.Entities.TaskPriority>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class UpdatePriorityResponse
{
}

public class UpdatePriorityCommandValidator : AbstractValidator<UpdatePriorityCommand>
{
    public UpdatePriorityCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Name)
            .NotNull().WithMessage("Name is required.");
        RuleFor(v => v.Name!.Value)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");
        RuleFor(v => v.Name)
            .MustAsync(async (item, name, cancellationToken) =>
            {
                if (name == null) return true;
                return !await context.GetSet<Novologs.Domain.Entities.TaskPriority>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() && c.Id != item.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class UpdatePriorityCommandHandler : IRequestHandler<UpdatePriorityCommand, Result<UpdatePriorityResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdatePriorityCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdatePriorityResponse>> Handle(UpdatePriorityCommand request,
        CancellationToken cancellationToken)
    {
        var priority = await _context.GetSet<Novologs.Domain.Entities.TaskPriority>().FindAsync(request.Id);
        if (priority == null)
        {
            return Result<UpdatePriorityResponse>.Failure("Priority_001", "Priority not found.");
        }

        _mapper.Map(request, priority);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdatePriorityResponse>.Success(new UpdatePriorityResponse());
    }
}
