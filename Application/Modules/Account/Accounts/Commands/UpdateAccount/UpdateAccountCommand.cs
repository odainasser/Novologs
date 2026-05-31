using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.Accounts.Commands.UpdateAccount;

[AuthorizePermission(Permissions.Accounting.UpdateAccount)]
public record UpdateAccountCommand : IRequest<Result<bool>>
{
    public Guid Id { get; init; }
    public string Name { get; init; } = default!;
    public AccountType? AccountType { get; init; }
    public AccountCategory? AccountCategory { get; init; }
    public Guid? ParentAccountId { get; init; }
    public bool? IsActive { get; init; }
}

public class UpdateAccountCommandHandler : IRequestHandler<UpdateAccountCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;

    public UpdateAccountCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UpdateAccountCommand request, CancellationToken cancellationToken)
    {
        // Find account
        var account = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .Include(a => a.ChildAccounts)
            .FirstOrDefaultAsync(a => a.Id == request.Id && !a.IsDeleted, cancellationToken);

        if (account == null)
        {
            return Result<bool>.Failure("Account_003", "Account not found.");
        }

        // Validate: Parent account exists if specified and is different from current
        if (request.ParentAccountId.HasValue && request.ParentAccountId.Value != account.ParentAccountId)
        {
            // Cannot set parent to self
            if (request.ParentAccountId.Value == account.Id)
            {
                return Result<bool>.Failure("Account_004", "Account cannot be its own parent.");
            }

            // Check if parent exists
            var parentAccount = await _context.GetSet<Novologs.Domain.Entities.Account>()
                .FirstOrDefaultAsync(a => a.Id == request.ParentAccountId.Value && !a.IsDeleted, cancellationToken);

            if (parentAccount == null)
            {
                return Result<bool>.Failure("Account_005", "Parent account not found.");
            }

            // Validate: Prevent circular reference (check if new parent is a descendant)
            if (await IsDescendantAsync(account.Id, request.ParentAccountId.Value, cancellationToken))
            {
                return Result<bool>.Failure("Account_006", "Cannot set parent to a descendant account (circular reference).");
            }

            // Calculate new level
            var newLevel = parentAccount.Level + 1;

            // Validate: Level cannot exceed 5
            if (newLevel > 5)
            {
                return Result<bool>.Failure("Account_007", "Account hierarchy cannot exceed 5 levels.");
            }

            // Validate: AccountType must match parent's AccountType if changing parent
            if (request.AccountType.HasValue && request.AccountType.Value != parentAccount.AccountType)
            {
                return Result<bool>.Failure("Account_008", "Account type must match parent account type.");
            }

            // Update level
            account.Level = newLevel;
            account.ParentAccountId = request.ParentAccountId.Value;
        }

        // Update account
        account.Name = request.Name;
        
        if (request.AccountType.HasValue)
            account.AccountType = request.AccountType.Value;
        
        if (request.AccountCategory.HasValue)
            account.AccountCategory = request.AccountCategory.Value;
        
        if (request.IsActive.HasValue)
            account.IsActive = request.IsActive.Value;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }

    private async Task<bool> IsDescendantAsync(Guid accountId, Guid potentialDescendantId, CancellationToken cancellationToken)
    {
        var descendant = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .FirstOrDefaultAsync(a => a.Id == potentialDescendantId, cancellationToken);

        while (descendant?.ParentAccountId != null)
        {
            if (descendant.ParentAccountId == accountId)
            {
                return true;
            }

            descendant = await _context.GetSet<Novologs.Domain.Entities.Account>()
                .FirstOrDefaultAsync(a => a.Id == descendant.ParentAccountId, cancellationToken);
        }

        return false;
    }
}
