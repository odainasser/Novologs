using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Goals.Commands.DeleteGoal;

public record DeleteGoalCommand : IRequest<Result<DeleteGoalResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteGoalResponse
{
}

public class DeleteGoalCommandValidator : AbstractValidator<DeleteGoalCommand>
{
    public DeleteGoalCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<ProjectGoal>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Goal not found.");
    }
}

public class DeleteGoalCommandHandler : IRequestHandler<DeleteGoalCommand, Result<DeleteGoalResponse>>
{
    private readonly ITenantDbContext _context;

    public DeleteGoalCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DeleteGoalResponse>> Handle(DeleteGoalCommand request, CancellationToken cancellationToken)
    {
        var projectGoal = await _context.GetSet<ProjectGoal>().FindAsync(request.Id);
        if (projectGoal == null)
        {
            return Result<DeleteGoalResponse>.Failure("Goal_002", "Goal not found.");
        }

        _context.GetSet<ProjectGoal>().Remove(projectGoal);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteGoalResponse>.Success(new DeleteGoalResponse());
    }
}
