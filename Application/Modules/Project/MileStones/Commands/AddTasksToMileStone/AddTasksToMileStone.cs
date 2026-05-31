using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Project.MileStones.Commands.AddTasksToMileStone;

public record AddTasksToMileStoneCommand : IRequest<Result<AddTasksToMileStoneResponse>>
{
    public Guid? MileStoneId { get; set; }
    public List<Guid> TaskIds { get; set; } = new();
}

public class AddTasksToMileStoneResponse
{
}

public class AddTasksToMileStoneCommandValidator : AbstractValidator<AddTasksToMileStoneCommand>
{
    public AddTasksToMileStoneCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.MileStoneId)
            .MustAsync(async (mileStoneId, cancellationToken) =>
            {
                if (mileStoneId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
                    .AnyAsync(m => m.Id == mileStoneId, cancellationToken);
            }).WithMessage("MileStoneId is invalid.");

        RuleFor(v => v.TaskIds)
            .NotEmpty().WithMessage("TaskIds is required.")
            .MustAsync(async (taskIds, cancellationToken) =>
            {
                if (!taskIds.Any()) return true;
                var existingTaskIds = await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .Where(t => taskIds.Contains(t.Id))
                    .Select(t => t.Id)
                    .ToListAsync(cancellationToken);
                return existingTaskIds.Count == taskIds.Count;
            }).WithMessage("One or more TaskIds are invalid.");
        
        //task and milestone are in the same project
        RuleFor(v => v)
            .MustAsync(async (command, cancellationToken) =>
            {
                if (command.MileStoneId == null || !command.TaskIds.Any()) return true;

                var milestone = await context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
                    .FirstOrDefaultAsync(m => m.Id == command.MileStoneId, cancellationToken);

                if (milestone == null) return false; // Already handled by MileStoneId validation

                var tasks = await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .Where(t => command.TaskIds.Contains(t.Id))
                    .ToListAsync(cancellationToken);

                return tasks.All(t => t.ProjectId == milestone.ProjectId);
            }).WithMessage("Tasks and milestone must belong to the same project.");
    }
}

public class
    AddTasksToMileStoneCommandHandler : IRequestHandler<AddTasksToMileStoneCommand, Result<AddTasksToMileStoneResponse>>
{
    private readonly ITenantDbContext _context;

    public AddTasksToMileStoneCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
    }

    public async Task<Result<AddTasksToMileStoneResponse>> Handle(AddTasksToMileStoneCommand request,
        CancellationToken cancellationToken)
    {
        var tasks = await _context.GetSet<Novologs.Domain.Entities.ProjectTask>()
            .Where(t => request.TaskIds.Contains(t.Id))
            .ToListAsync(cancellationToken);

        foreach (var task in tasks)
        {
            task.MileStoneId = request.MileStoneId;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddTasksToMileStoneResponse>.Success(new AddTasksToMileStoneResponse());
    }
}
