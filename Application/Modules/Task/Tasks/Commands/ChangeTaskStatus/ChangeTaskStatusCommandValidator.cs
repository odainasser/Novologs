using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Tasks.Tasks.Commands.ChangeTaskStatus;

public class ChangeTaskStatusCommandValidator : AbstractValidator<ChangeTaskStatusCommand>
{
    public ChangeTaskStatusCommandValidator(
        ITenantDbContext context
    )
    {
    
        RuleFor(d => d.TaskId)
            .NotEmpty()
            .MustAsync(async (id, token) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .AnyAsync(d => d.Id == id, token);
            })
            .WithMessage("Invalid Task Id");
            
        RuleFor(d => d.StatusId)
            .NotEmpty()
            .MustAsync(async (id, token) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.TaskStatus>()
                    .AnyAsync(d => d.Id == id, token);
            })
            .WithMessage("Invalid Status Id");

        //user id must be task member's user id and not task creator
        RuleFor(d => d.UserId)
            .MustAsync(async (command, userId, token) =>
            {
                if (userId == null) return true; // If UserId is not provided, it defaults to the current user, which is handled by authorization.

                var task = await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .Include(t => t.Members)
                    .FirstOrDefaultAsync(t => t.Id == command.TaskId, token);

                if (task == null) return false; // Task not found

                return task.Members.Any(m => m.MemberId == userId);
            })
            .WithMessage("Target user is not a member of this task.");

    }
}
