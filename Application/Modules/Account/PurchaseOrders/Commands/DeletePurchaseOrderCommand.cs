using Novologs.Application.Modules.Account.PurchaseOrders.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.PurchaseOrders.Commands.DeletePurchaseOrder;

[AuthorizePermission(Permissions.Accounting.DeletePurchaseOrder)]
public record DeletePurchaseOrderCommand(int Id) : IRequest<Result<Unit>>;

public class DeletePurchaseOrderCommandHandler : IRequestHandler<DeletePurchaseOrderCommand, Result<Unit>>
{
    private readonly IPurchaseOrderRepository _repository;

    public DeletePurchaseOrderCommandHandler(IPurchaseOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Unit>> Handle(DeletePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var po = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (po is null)
            return Result<Unit>.Failure("PO_404_NOT_FOUND", $"Purchase order with ID {request.Id} was not found.");

        if (po.Status != PurchaseOrderStatus.Draft)
            return Result<Unit>.Failure("PO_409_NOT_DRAFT", "Only Draft purchase orders can be deleted.");

        po.IsDeleted = true;

        await _repository.UpdateAsync(po, cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
