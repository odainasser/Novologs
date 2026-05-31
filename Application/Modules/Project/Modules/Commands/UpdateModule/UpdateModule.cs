using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Modules.Commands.UpdateModule;

public record UpdateModuleCommand : IRequest<Result<UpdateModuleResponse>>
{
    public Guid Id { get; set; }

    public Guid? ProjectId { get; set; }
    public LocalizableTextInputDto? Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateModuleCommand, ProjectModule>()
                .ForMember(dest => dest.Name,
                    opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class UpdateModuleResponse
{
}

public class UpdateModuleCommandValidator : AbstractValidator<UpdateModuleCommand>
{
    public UpdateModuleCommandValidator(ITenantDbContext context)
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
                //TODO check only for modules names (for others ) in add and update ie goals initiatives 
                return !await context.GetSet<ProjectModule>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() && c.NameId != name.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");

        RuleFor(v => v.ProjectId)
            .MustAsync(async (projectId, cancellationToken) =>
            {
                if (projectId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.Project>()
                    .AnyAsync(p => p.Id == projectId, cancellationToken);
            }).WithMessage("ProjectId is invalid.");
    }
}

public class UpdateModuleCommandHandler : IRequestHandler<UpdateModuleCommand, Result<UpdateModuleResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateModuleCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateModuleResponse>> Handle(UpdateModuleCommand request,
        CancellationToken cancellationToken)
    {
        var projectModule = await _context.GetSet<ProjectModule>().FindAsync(request.Id);
        if (projectModule == null)
        {
            return Result<UpdateModuleResponse>.Failure("Module_001", "Module not found.");
        }

        _mapper.Map(request, projectModule);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdateModuleResponse>.Success(new UpdateModuleResponse());
    }
}
