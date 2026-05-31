using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Tasks.Priorities.Commands.DeletePriority;

public record DeletePriorityCommand : IRequest<Result<DeletePriorityResponse>>
{
    public Guid Id { get; set; }
}

public class DeletePriorityResponse
{
}

public class DeletePriorityCommandValidator : AbstractValidator<DeletePriorityCommand>
{
    public DeletePriorityCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.TaskPriority>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Priority not found.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return !await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .AnyAsync(t => t.PriorityId == id, cancellationToken);
            }).WithMessage("Priority is in use by one or more tasks and cannot be deleted.");
    }
}

public class DeletePriorityCommandHandler : IRequestHandler<DeletePriorityCommand, Result<DeletePriorityResponse>>
{
    private readonly ITenantDbContext _context;

    public DeletePriorityCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
    }

    public async Task<Result<DeletePriorityResponse>> Handle(DeletePriorityCommand request,
        CancellationToken cancellationToken)
    {
        var priority = await _context.GetSet<Novologs.Domain.Entities.TaskPriority>().FindAsync(request.Id);
        if (priority == null)
        {
            return Result<DeletePriorityResponse>.Failure("Priority_002", "Priority not found.");
        }

        _context.GetSet<Novologs.Domain.Entities.TaskPriority>().Remove(priority);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeletePriorityResponse>.Success(new DeletePriorityResponse());

    }
}
