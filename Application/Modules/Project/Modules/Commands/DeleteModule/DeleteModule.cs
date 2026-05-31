using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Modules.Commands.DeleteModule;

public record DeleteModuleCommand : IRequest<Result<DeleteModuleResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteModuleResponse
{
}

public class DeleteModuleCommandValidator : AbstractValidator<DeleteModuleCommand>
{
    public DeleteModuleCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<ProjectModule>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Module not found.");
    }
}

public class DeleteModuleCommandHandler : IRequestHandler<DeleteModuleCommand, Result<DeleteModuleResponse>>
{
    private readonly ITenantDbContext _context;

    public DeleteModuleCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DeleteModuleResponse>> Handle(DeleteModuleCommand request,
        CancellationToken cancellationToken)
    {
        var projectModule = await _context.GetSet<ProjectModule>().FindAsync(request.Id);
        if (projectModule == null)
        {
            return Result<DeleteModuleResponse>.Failure("Module_002", "Module not found.");
        }

        _context.GetSet<ProjectModule>().Remove(projectModule);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteModuleResponse>.Success(new DeleteModuleResponse());
    }
}
