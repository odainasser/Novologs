using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Tasks.Statuses.Commands.DeleteStatus;

public record DeleteStatusCommand : IRequest<Result<DeleteStatusResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteStatusResponse
{
}

public class DeleteStatusCommandValidator : AbstractValidator<DeleteStatusCommand>
{
    public DeleteStatusCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.TaskStatus>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Status not found.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                var status = await context.GetSet<Novologs.Domain.Entities.TaskStatus>()
                    .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
                if (status == null) return true;
                return status.Status == Novologs.Domain.Enums.ProjectTaskStatus.Other;
            }).WithMessage("Status can not be deleted.");
    }
}

public class DeleteStatusCommandHandler : IRequestHandler<DeleteStatusCommand, Result<DeleteStatusResponse>>
{
    private readonly ITenantDbContext _context;

    public DeleteStatusCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
    }

    public async Task<Result<DeleteStatusResponse>> Handle(DeleteStatusCommand request,
        CancellationToken cancellationToken)
    {
        var status = await _context.GetSet<Novologs.Domain.Entities.TaskStatus>().FindAsync(request.Id);
        if (status == null)
        {
            return Result<DeleteStatusResponse>.Failure("Status_002", "Status not found.");
        }

        _context.GetSet<Novologs.Domain.Entities.TaskStatus>().Remove(status);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteStatusResponse>.Success(new DeleteStatusResponse());
    }
}
