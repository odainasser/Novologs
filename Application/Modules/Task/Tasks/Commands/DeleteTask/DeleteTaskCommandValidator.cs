using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Tasks.Tasks.Commands.DeleteTask;

public class DeleteTaskCommandValidator : AbstractValidator<DeleteTaskCommand>
{
    public DeleteTaskCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .AnyAsync(d => d.Id == id, cancellationToken);
            }).WithMessage("Id is not valid.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                var task = await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .Include(d => d.ChildTasks)
                    .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
                if (task == null) return true;
                return !task.ChildTasks.Any();
            }).WithMessage("Task has sub tasks.");
    }
}
