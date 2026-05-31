using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.TaskTypes.Commands.UpdateTaskType;

public record UpdateTaskTypeCommand : IRequest<Result<UpdateTaskTypeResponse>>
{
    public Guid Id { get; set; }
    public LocalizableTextInputDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateTaskTypeCommand, Novologs.Domain.Entities.ProjectTaskType>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class UpdateTaskTypeResponse
{
}

public class UpdateTaskTypeCommandValidator : AbstractValidator<UpdateTaskTypeCommand>
{
    public UpdateTaskTypeCommandValidator(ITenantDbContext context)
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
                return !await context.GetSet<ProjectTaskType>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() && c.NameId != name.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class UpdateTaskTypeCommandHandler : IRequestHandler<UpdateTaskTypeCommand, Result<UpdateTaskTypeResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateTaskTypeCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateTaskTypeResponse>> Handle(UpdateTaskTypeCommand request,
        CancellationToken cancellationToken)
    {
        var projectTaskType = await _context.GetSet<ProjectTaskType>().FindAsync(request.Id);
        if (projectTaskType == null)
        {
            return Result<UpdateTaskTypeResponse>.Failure("TaskType_001", "TaskType not found.");
        }

        _mapper.Map(request, projectTaskType);
        await _context.SaveChangesAsync(cancellationToken);
//TODO: add email sending, notificaiton
        
        return Result<UpdateTaskTypeResponse>.Success(new UpdateTaskTypeResponse());
    }
}
