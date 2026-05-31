using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Products.Commands.DeleteProductOrderType;
[AuthorizePermission(Permissions.Accounting.DeleteProductOrderType)]
public record DeleteProductOrderTypeCommand(Guid Id) : IRequest<Result<Unit>>;

public class DeleteProductOrderTypeCommandHandler : IRequestHandler<DeleteProductOrderTypeCommand, Result<Unit>>
{
    private readonly ITenantDbContext _context;

    public DeleteProductOrderTypeCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Unit>> Handle(DeleteProductOrderTypeCommand request, CancellationToken cancellationToken)
    {
        var orderType = await _context.GetSet<Novologs.Domain.Entities.ProductOrderType>()
            .FirstOrDefaultAsync(o => o.Id == request.Id && !o.IsDeleted, cancellationToken);

        if (orderType is null)
            return Result<Unit>.Failure("POTYPE_404_NOT_FOUND", $"Product order type with ID {request.Id} was not found.");

        orderType.IsDeleted = true;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
