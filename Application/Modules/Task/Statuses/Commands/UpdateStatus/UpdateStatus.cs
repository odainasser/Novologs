using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Tasks.Statuses.Commands.UpdateStatus;

public record UpdateStatusCommand : IRequest<Result<UpdateStatusResponse>>
{
    public Guid Id { get; set; }
    public LocalizableTextInputDto Name { get; set; } = null!;

    public string? Color { get; set; }

    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateStatusCommand, Novologs.Domain.Entities.TaskStatus>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Color, opt => opt.Condition(src => src.Color != null))
                ;
        }
    }
}

public class UpdateStatusResponse
{
}

public class UpdateStatusCommandValidator : AbstractValidator<UpdateStatusCommand>
{
    public UpdateStatusCommandValidator(ITenantDbContext context)
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
                return !await context.GetSet<Novologs.Domain.Entities.TaskStatus>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() && c.Id != item.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class UpdateStatusCommandHandler : IRequestHandler<UpdateStatusCommand, Result<UpdateStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateStatusCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateStatusResponse>> Handle(UpdateStatusCommand request,
        CancellationToken cancellationToken)
    {
        var status = await _context.GetSet<Novologs.Domain.Entities.TaskStatus>().FindAsync(request.Id);
        if (status == null)
        {
            return Result<UpdateStatusResponse>.Failure("Status_001", "Status not found.");
        }

        var oldName = status.Name;
        _mapper.Map(request, status);
        if (
            status.Status == Novologs.Domain.Enums.ProjectTaskStatus.NotStarted ||
            status.Status == Novologs.Domain.Enums.ProjectTaskStatus.InProgress ||
            status.Status == Novologs.Domain.Enums.ProjectTaskStatus.OnHold ||
            status.Status == Novologs.Domain.Enums.ProjectTaskStatus.Submitted ||
            status.Status == Novologs.Domain.Enums.ProjectTaskStatus.Completed
        )
        {
            status.Name = oldName;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdateStatusResponse>.Success(new UpdateStatusResponse());
    }
}
