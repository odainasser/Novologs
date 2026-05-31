using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Products.Commands.DeleteProductUnit;

public record DeleteProductUnitCommand(Guid Id) : IRequest<Result<Unit>>;

public class DeleteProductUnitCommandHandler : IRequestHandler<DeleteProductUnitCommand, Result<Unit>>
{
    private readonly ITenantDbContext _context;

    public DeleteProductUnitCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Unit>> Handle(DeleteProductUnitCommand request, CancellationToken cancellationToken)
    {
        var unit = await _context.GetSet<Novologs.Domain.Entities.ProductUnit>()
            .FirstOrDefaultAsync(u => u.Id == request.Id && !u.IsDeleted, cancellationToken);

        if (unit is null)
            return Result<Unit>.Failure("PUNIT_404_NOT_FOUND", $"Product unit with ID {request.Id} was not found.");

        unit.IsDeleted = true;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
