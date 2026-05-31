using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Tasks.Categories.Commands.AddCategory;

public record AddCategoryCommand : IRequest<Result<AddCategoryResponse>>
{
    public LocalizableTextDto Name { get; set; } = null!;

    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddCategoryCommand, Novologs.Domain.Entities.TaskCategory>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
            ;
        }
    }
}

public class AddCategoryResponse
{
    public Guid Id { get; set; }
}

public class AddCategoryCommandValidator : AbstractValidator<AddCategoryCommand>
{
    public AddCategoryCommandValidator(ITenantDbContext context)
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
                return !await context.GetSet<Novologs.Domain.Entities.TaskCategory>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower(),
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class AddCategoryCommandHandler : IRequestHandler<AddCategoryCommand, Result<AddCategoryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddCategoryCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AddCategoryResponse>> Handle(AddCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var category = _mapper.Map<Novologs.Domain.Entities.TaskCategory>(request);
        await _context.GetSet<Novologs.Domain.Entities.TaskCategory>().AddAsync(category, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddCategoryResponse>.Success(new AddCategoryResponse() { Id = category.Id });
    }
}
