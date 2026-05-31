using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Products.Commands.DeleteProductTerm;
[AuthorizePermission(Permissions.Accounting.DeleteProductTerm)]
public record DeleteProductTermCommand(Guid Id) : IRequest<Result<Unit>>;

public class DeleteProductTermCommandHandler : IRequestHandler<DeleteProductTermCommand, Result<Unit>>
{
    private readonly ITenantDbContext _context;

    public DeleteProductTermCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Unit>> Handle(DeleteProductTermCommand request, CancellationToken cancellationToken)
    {
        var term = await _context.GetSet<Novologs.Domain.Entities.ProductTerm>()
            .FirstOrDefaultAsync(t => t.Id == request.Id && !t.IsDeleted, cancellationToken);

        if (term is null)
            return Result<Unit>.Failure("PTERM_404_NOT_FOUND", $"Product term with ID {request.Id} was not found.");

        term.IsDeleted = true;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
