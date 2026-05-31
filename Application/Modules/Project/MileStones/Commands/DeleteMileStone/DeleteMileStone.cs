using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Project.MileStones.Commands.DeleteMileStone;

public record DeleteMileStoneCommand : IRequest<Result<DeleteMileStoneResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteMileStoneResponse
{
}

public class DeleteMileStoneCommandValidator : AbstractValidator<DeleteMileStoneCommand>
{
    public DeleteMileStoneCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
                    .AnyAsync(p => p.Id == id, cancellationToken);
            }).WithMessage("Invalid Milestone Id");
    }
}

public class DeleteMileStoneCommandHandler : IRequestHandler<DeleteMileStoneCommand, Result<DeleteMileStoneResponse>>
{
    private readonly ITenantDbContext _context;

    public DeleteMileStoneCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DeleteMileStoneResponse>> Handle(DeleteMileStoneCommand request,
        CancellationToken cancellationToken)
    {
        var mileStone = await _context.GetSet<Novologs.Domain.Entities.ProjectMileStone>()
            .FindAsync(new object?[] { request.Id }, cancellationToken: cancellationToken);
        if (mileStone == null)
        {
            return Result<DeleteMileStoneResponse>.Failure("ProjectMilestone_002", "MileStone not found.");
        }

        _context.GetSet<Novologs.Domain.Entities.ProjectMileStone>().Remove(mileStone);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteMileStoneResponse>.Success(new DeleteMileStoneResponse());
    }
}
