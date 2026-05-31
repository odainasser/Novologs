using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Initiatives.Commands.DeleteInitiative;

public record DeleteInitiativeCommand : IRequest<Result<DeleteInitiativeResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteInitiativeResponse
{
}

public class DeleteInitiativeCommandValidator : AbstractValidator<DeleteInitiativeCommand>
{
    public DeleteInitiativeCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<ProjectInitiative>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Initiative not found.");
    }
}

public class DeleteInitiativeCommandHandler : IRequestHandler<DeleteInitiativeCommand, Result<DeleteInitiativeResponse>>
{
    private readonly ITenantDbContext _context;

    public DeleteInitiativeCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DeleteInitiativeResponse>> Handle(DeleteInitiativeCommand request,
        CancellationToken cancellationToken)
    {
        var projectInitiative = await _context.GetSet<ProjectInitiative>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (projectInitiative == null)
        {
            return Result<DeleteInitiativeResponse>.Failure("Initiative_02", "Initiative not found.");
        }

        _context.GetSet<ProjectInitiative>().Remove(projectInitiative);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteInitiativeResponse>.Success(new DeleteInitiativeResponse());
    }
}
