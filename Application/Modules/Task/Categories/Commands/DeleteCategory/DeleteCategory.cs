using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Tasks.Categories.Commands.DeleteCategory;

public record DeleteCategoryCommand : IRequest<Result<DeleteCategoryResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteCategoryResponse
{
}

public class DeleteCategoryCommandValidator : AbstractValidator<DeleteCategoryCommand>
{
    public DeleteCategoryCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.TaskCategory>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Category not found.");
    }
}

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, Result<DeleteCategoryResponse>>
{
    private readonly ITenantDbContext _context;

    public DeleteCategoryCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
    }

    public async Task<Result<DeleteCategoryResponse>> Handle(DeleteCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var category = await _context.GetSet<Novologs.Domain.Entities.TaskCategory>().FindAsync(request.Id);
        if (category == null)
        {
            return Result<DeleteCategoryResponse>.Failure("Category_002", "Category not found.");
        }

        _context.GetSet<Novologs.Domain.Entities.TaskCategory>().Remove(category);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteCategoryResponse>.Success(new DeleteCategoryResponse());
    }
}
