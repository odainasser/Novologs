using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Account.Accounts.Commands.DeleteAccount;
[AuthorizePermission(Permissions.Accounting.DeleteAccount)]
public record DeleteAccountCommand : IRequest<Result<bool>>
{
    public Guid Id { get; init; }
}

public class DeleteAccountCommandHandler : IRequestHandler<DeleteAccountCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;

    public DeleteAccountCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        // Find account
        var account = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .Include(a => a.ChildAccounts)
            .FirstOrDefaultAsync(a => a.Id == request.Id && !a.IsDeleted, cancellationToken);

        if (account == null)
        {
            return Result<bool>.Failure("Account_006", "Account not found.");
        }

        // Check if account has active children
        if (account.ChildAccounts.Any(c => !c.IsDeleted))
        {
            return Result<bool>.Failure("Account_007", "Cannot delete account with active child accounts.");
        }

        // Check if account has any posted transaction lines
        var hasPostedTransactions = await _context.GetSet<Novologs.Domain.Entities.AccountTransactionLine>()
            .AnyAsync(tl => tl.AccountId == request.Id && tl.Transaction.IsPosted, cancellationToken);

        if (hasPostedTransactions)
        {
            return Result<bool>.Failure("Account_008", "Cannot delete account with posted transactions.");
        }

        // Check if account is linked to a vendor
        var hasVendor = await _context.GetSet<Novologs.Domain.Entities.VendorAccount>()
            .AnyAsync(va => va.AccountId == request.Id, cancellationToken);

        if (hasVendor)
        {
            return Result<bool>.Failure("Account_009", "Cannot delete account linked to a vendor.");
        }

        // Soft delete (interceptor will set IsDeleted = true)
        _context.GetSet<Novologs.Domain.Entities.Account>().Remove(account);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
