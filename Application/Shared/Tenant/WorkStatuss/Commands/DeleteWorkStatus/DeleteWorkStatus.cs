using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.WorkStatuss.Commands.DeleteWorkStatus;

public record DeleteWorkStatusCommand : IRequest<Result<DeleteWorkStatusResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteWorkStatusResponse
{
}

public class DeleteWorkStatusCommandValidator : AbstractValidator<DeleteWorkStatusCommand>
{
    public DeleteWorkStatusCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .NotNull()
            .WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
                await context.GetSet<Domain.Entities.WorkStatus>().AnyAsync(ws => ws.Id == id, cancellationToken))
            .WithMessage("The specified Work Status does not exist.");
    }
}

public class DeleteWorkStatusCommandHandler : IRequestHandler<DeleteWorkStatusCommand, Result<DeleteWorkStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public DeleteWorkStatusCommandHandler(ITenantDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<Result<DeleteWorkStatusResponse>> Handle(DeleteWorkStatusCommand request,
        CancellationToken cancellationToken)
    {
        var entity = await _context.GetSet<Domain.Entities.WorkStatus>()
            .FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null)
        {
            return Result<DeleteWorkStatusResponse>.Failure("WorkStatus_001", "Work Status not found.");
        }

        _context.GetSet<Domain.Entities.WorkStatus>().Remove(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteWorkStatusResponse>.Success(new DeleteWorkStatusResponse());
    }
}
