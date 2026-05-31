using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Tasks.Categories.Commands.UpdateCategory;

public record UpdateCategoryCommand : IRequest<Result<UpdateCategoryResponse>>
{
    public Guid Id { get; set; }
    public LocalizableTextInputDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateCategoryCommand, Novologs.Domain.Entities.TaskCategory>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class UpdateCategoryResponse
{
}

public class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator(ITenantDbContext context)
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
                return !await context.GetSet<Novologs.Domain.Entities.TaskCategory>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() && c.Id != item.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, Result<UpdateCategoryResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateCategoryCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateCategoryResponse>> Handle(UpdateCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var category = await _context.GetSet<Novologs.Domain.Entities.TaskCategory>().FindAsync(request.Id);
        if (category == null)
        {
            return Result<UpdateCategoryResponse>.Failure("Category_001", "Category not found.");
        }
        
        _mapper.Map(request, category);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdateCategoryResponse>.Success(new UpdateCategoryResponse());
    }
}
