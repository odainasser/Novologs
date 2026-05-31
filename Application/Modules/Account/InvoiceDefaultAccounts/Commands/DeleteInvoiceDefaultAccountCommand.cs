using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.InvoiceDefaultAccounts.Commands.DeleteInvoiceDefaultAccount;
[AuthorizePermission(Permissions.Accounting.DeleteInvoiceDefaultAccount)]
public record DeleteInvoiceDefaultAccountCommand(Guid Id) : IRequest<Result<Unit>>;

public class DeleteInvoiceDefaultAccountCommandHandler : IRequestHandler<DeleteInvoiceDefaultAccountCommand, Result<Unit>>
{
    private readonly ITenantDbContext _context;

    public DeleteInvoiceDefaultAccountCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Unit>> Handle(DeleteInvoiceDefaultAccountCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.GetSet<Novologs.Domain.Entities.InvoiceDefaultAccount>()
            .FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted, cancellationToken);

        if (entity is null)
            return Result<Unit>.Failure("INVDEFACC_404_NOT_FOUND", $"Invoice default account with ID {request.Id} was not found.");

        entity.IsDeleted = true;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
