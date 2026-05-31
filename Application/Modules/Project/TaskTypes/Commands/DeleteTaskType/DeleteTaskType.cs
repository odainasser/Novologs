using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.TaskTypes.Commands.DeleteTaskType;

public record DeleteTaskTypeCommand : IRequest<Result<DeleteTaskTypeResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteTaskTypeResponse
{
}

public class DeleteTaskTypeCommandValidator : AbstractValidator<DeleteTaskTypeCommand>
{
    public DeleteTaskTypeCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<ProjectTaskType>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("TaskType not found.");
    }
}

public class DeleteTaskTypeCommandHandler : IRequestHandler<DeleteTaskTypeCommand, Result<DeleteTaskTypeResponse>>
{
    private readonly ITenantDbContext _context;

    public DeleteTaskTypeCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DeleteTaskTypeResponse>> Handle(DeleteTaskTypeCommand request,
        CancellationToken cancellationToken)
    {
        var projectTaskType = await _context.GetSet<ProjectTaskType>().FindAsync(request.Id);
        if (projectTaskType == null)
        {
            return Result<DeleteTaskTypeResponse>.Failure("TaskType_002", "TaskType not found.");
        }

        _context.GetSet<ProjectTaskType>().Remove(projectTaskType);
        await _context.SaveChangesAsync(cancellationToken);
//TODO: add email sending, notificaiton
        
        return Result<DeleteTaskTypeResponse>.Success(new DeleteTaskTypeResponse());
    }
}
