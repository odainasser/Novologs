using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Products.Commands.DeleteProduct;
[AuthorizePermission(Permissions.Accounting.DeleteProduct)]
public record DeleteProductCommand(int Id) : IRequest<Result<Unit>>;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Result<Unit>>
{
    private readonly ITenantDbContext _context;

    public DeleteProductCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Unit>> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.GetSet<Novologs.Domain.Entities.Product>()
            .FirstOrDefaultAsync(p => p.Id == request.Id && !p.IsDeleted, cancellationToken);

        if (product is null)
            return Result<Unit>.Failure("PRD_404_NOT_FOUND", $"Product with ID {request.Id} was not found.");

        var isUsedInPO = await _context.GetSet<Novologs.Domain.Entities.PurchaseOrderItem>()
            .AnyAsync(i => i.ProductId == request.Id, cancellationToken);

        if (isUsedInPO)
            return Result<Unit>.Failure("PRD_409_IN_USE", "Cannot delete a product that is referenced in one or more purchase orders.");

        product.IsDeleted = true;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
