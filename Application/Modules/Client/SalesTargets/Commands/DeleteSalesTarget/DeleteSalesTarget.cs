using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.SalesTargets.Commands.DeleteSalesTarget;

public record DeleteSalesTargetCommand : IRequest<Result<DeleteSalesTargetResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteSalesTargetResponse
{
}

public class DeleteSalesTargetCommandValidator : AbstractValidator<DeleteSalesTargetCommand>
{
    public DeleteSalesTargetCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<SalesTarget>().AnyAsync(st => st.Id == id, cancellationToken);
            })
            .WithMessage("Sales target not found.");
    }
}

public class
    DeleteSalesTargetCommandHandler : IRequestHandler<DeleteSalesTargetCommand, Result<DeleteSalesTargetResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public DeleteSalesTargetCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<DeleteSalesTargetResponse>> Handle(DeleteSalesTargetCommand request,
        CancellationToken cancellationToken)
    {
        var entity = await _context.GetSet<SalesTarget>()
            .FirstOrDefaultAsync(st => st.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<DeleteSalesTargetResponse>.Failure("SalesTarget_001", "Sales target not found.");
        }

        _context.GetSet<SalesTarget>().Remove(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteSalesTargetResponse>.Success(new());
    }
}
