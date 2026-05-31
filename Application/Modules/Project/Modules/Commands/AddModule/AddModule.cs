using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Modules.Commands.AddModule;

public record AddModuleCommand : IRequest<Result<AddModuleResponse>>
{
    public Guid ProjectId { get; set; }
    public LocalizableTextInputDto? Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddModuleCommand, ProjectModule>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => new LocalizableText() { Value = src.Name!.Value }));
        }

    }
}

public class AddModuleResponse
{
    public Guid Id { get; set; }
}

public class AddModuleCommandValidator : AbstractValidator<AddModuleCommand>
{
    public AddModuleCommandValidator(ITenantDbContext context)
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
                return !await context.GetSet<ProjectModule>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower(),
                        cancellationToken);
            }).WithMessage("Name already used.");
        
        RuleFor(v => v.ProjectId)
            .NotEmpty().WithMessage("ProjectId is required.");
        RuleFor(v => v.ProjectId)
            .MustAsync(async (projectId, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.Project>()
                    .AnyAsync(p => p.Id == projectId, cancellationToken);
            }).WithMessage("ProjectId is invalid.");

    }
}

public class AddModuleCommandHandler : IRequestHandler<AddModuleCommand, Result<AddModuleResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddModuleCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AddModuleResponse>> Handle(AddModuleCommand request, CancellationToken cancellationToken)
    {
        var projectModule = _mapper.Map<ProjectModule>(request);
        await _context.GetSet<ProjectModule>().AddAsync(projectModule, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddModuleResponse>.Success(new AddModuleResponse() { Id = projectModule.Id });
    }
}
