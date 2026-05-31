using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Tasks.Statuses.Commands.AddStatus;

public record AddStatusCommand : IRequest<Result<AddStatusResponse>>
{
    public LocalizableTextInputDto Name { get; set; } = null!;
    public string? Color { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddStatusCommand, Novologs.Domain.Entities.TaskStatus>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Novologs.Domain.Enums.ProjectTaskStatus.Other))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Color, opt => opt.MapFrom(src => src.Color))
                ;
        }
    }
}

public class AddStatusResponse
{
    public Guid Id { get; set; }
}

public class AddStatusCommandValidator : AbstractValidator<AddStatusCommand>
{
    public AddStatusCommandValidator(ITenantDbContext context)
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
                return !await context.GetSet<Novologs.Domain.Entities.TaskStatus>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower(),
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class AddStatusCommandHandler : IRequestHandler<AddStatusCommand, Result<AddStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddStatusCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AddStatusResponse>> Handle(AddStatusCommand request, CancellationToken cancellationToken)
    {
        var status = _mapper.Map<Novologs.Domain.Entities.TaskStatus>(request);
        await _context.GetSet<Novologs.Domain.Entities.TaskStatus>().AddAsync(status, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddStatusResponse>.Success(new AddStatusResponse() { Id = status.Id });
    }
}
