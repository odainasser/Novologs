using Novologs.Application.Modules.Account.Accounts.DTOs;
using Microsoft.EntityFrameworkCore.Storage;
using Npgsql;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.Accounts.Commands.CreateAccount;

public record CreateAccountResponse(Guid Id);

[AuthorizePermission(Permissions.Accounting.AddAccount)]
public record CreateAccountCommand : IRequest<Result<CreateAccountResponse>>
{
    /// <summary>
    /// Optional. If omitted, the backend auto-generates the code by incrementing
    /// based on level: Level 1: +10000, Level 2: +1000, Level 3: +100, Level 4: +10, Level 5: +1
    /// (e.g. parent "11100" at Level 3 â†’ children "11110", "11120", "11130", â€¦).
    /// For root-level accounts (no parent) this field is required.
    /// </summary>
    public string? Code { get; init; }
    public string Name { get; init; } = default!;
    public AccountType AccountType { get; init; }
    public AccountCategory AccountCategory { get; init; }
    public Guid? ParentAccountId { get; init; }
    public bool IsSubcategory { get; init; } = false;
}

public class CreateAccountCommandHandler : IRequestHandler<CreateAccountCommand, Result<CreateAccountResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public CreateAccountCommandHandler(ITenantDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<Result<CreateAccountResponse>> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
    {
        int accountLevel = 1;
        Novologs.Domain.Entities.Account? parentAccount = null;

        // Resolve parent first (needed for both level validation and auto code generation)
        if (request.ParentAccountId.HasValue)
        {
            parentAccount = await _context.GetSet<Novologs.Domain.Entities.Account>()
                .FirstOrDefaultAsync(a => a.Id == request.ParentAccountId.Value && !a.IsDeleted, cancellationToken);

            if (parentAccount == null)
            {
                return Result<CreateAccountResponse>.Failure("Account_002", "Parent account not found.");
            }

            // Calculate level: parent level + 1
            accountLevel = parentAccount.Level + 1;

            // Validate: Level cannot exceed 5
            if (accountLevel > 5)
            {
                return Result<CreateAccountResponse>.Failure("Account_003", "Account hierarchy cannot exceed 5 levels.");
            }

            // Validate: AccountType must match parent's AccountType
            if (request.AccountType != parentAccount.AccountType)
            {
                return Result<CreateAccountResponse>.Failure("Account_004", "Account type must match parent account type.");
            }
        }

        // Determine account code
        string accountCode;
        if (!string.IsNullOrWhiteSpace(request.Code))
        {
            accountCode = request.Code.Trim();
        }
        else if (parentAccount != null)
        {
            // Auto-generate: parent code + level-based increment (10000, 1000, 100, 10, or 1)
            accountCode = await GenerateNextCodeAsync(parentAccount.Code, request.ParentAccountId!.Value, cancellationToken);
        }
        else
        {
            return Result<CreateAccountResponse>.Failure("Account_005", "Account code is required for root-level accounts.");
        }

        // For explicitly provided codes: validate global uniqueness (includes soft-deleted rows).
        // Auto-generated codes are already guaranteed unique by GenerateNextCodeAsync.
        if (!string.IsNullOrWhiteSpace(request.Code))
        {
            var codeExists = await _context.GetSet<Novologs.Domain.Entities.Account>()
                .IgnoreQueryFilters()
                .AnyAsync(a => a.Code == accountCode, cancellationToken);

            if (codeExists)
            {
                return Result<CreateAccountResponse>.Failure("Account_001", $"Account with code '{accountCode}' already exists.");
            }
        }

        //// Validate account name uniqueness globally (case-insensitive)
        // var nameExists = await _context.GetSet<Novologs.Domain.Entities.Account>()
        //     .AnyAsync(a => a.Name.ToLower() == request.Name.ToLower() && !a.IsDeleted, cancellationToken);

        // if (nameExists)
        // {
        //     return Result<CreateAccountResponse>.Failure("Account_006", $"Account with name '{request.Name}' already exists.");
        // }

        // Create account
        var account = new Novologs.Domain.Entities.Account(Guid.NewGuid())
        {
            Code = accountCode,
            Name = request.Name,
            AccountType = request.AccountType,
            AccountCategory = request.AccountCategory,
            Level = accountLevel,
            ParentAccountId = request.ParentAccountId,
            IsActive = true,
            IsSubcategory = request.IsSubcategory
        };

        await _context.GetSet<Novologs.Domain.Entities.Account>().AddAsync(account, cancellationToken);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is PostgresException pgEx && pgEx.SqlState == PostgresErrorCodes.UniqueViolation
                  && pgEx.ConstraintName == "IX_Accounts_Code")
        {
            return Result<CreateAccountResponse>.Failure("Account_001", $"Account with code '{accountCode}' already exists.");
        }

        return Result<CreateAccountResponse>.Success(new CreateAccountResponse(account.Id));
    }

        /// <summary>
    /// Generates the next available sequential code for a child account.
    /// Pattern: parentCode + increment based on level
    /// Increments by power of 10 based on child level:
    /// - Level 1: +10,000 â†’ 10000, 20000, 30000
    /// - Level 2: +1,000  â†’ 11000, 12000, 13000
    /// - Level 3: +100    â†’ 11100, 11200, 11300
    /// - Level 4: +10     â†’ 11110, 11120, 11130
    /// - Level 5: +1      â†’ 11111, 11112, 11113
    /// 
    /// Example: Parent 11100 (Level 3) â†’ Children at Level 4: 11110, 11120, 11130, 11140...
    /// </summary>
    private async Task<string> GenerateNextCodeAsync(string parentCode, Guid parentId, CancellationToken cancellationToken)
    {
        // Get parent level to determine child level and increment
        var parentAccount = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .FirstOrDefaultAsync(a => a.Id == parentId, cancellationToken);
        
        if (parentAccount == null)
            throw new InvalidOperationException("Parent account not found.");
        
        int childLevel = parentAccount.Level + 1;
        
        // Calculate increment based on child level: 10^(5 - childLevel)
        // Level 1: 10^4 = 10000, Level 2: 10^3 = 1000, Level 3: 10^2 = 100, Level 4: 10^1 = 10, Level 5: 10^0 = 1
        int increment = (int)Math.Pow(10, 5 - childLevel);
        
        // Scan all children of this parent (including soft-deleted) to find the highest code
        var siblingCodes = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .IgnoreQueryFilters()
            .Where(a => a.ParentAccountId == parentId)
            .Select(a => a.Code)
            .ToListAsync(cancellationToken);

        int maxCode = 0;
        if (!int.TryParse(parentCode, out int parentCodeInt))
            throw new InvalidOperationException($"Parent code '{parentCode}' is not a valid numeric code.");
        
        // Find the highest existing code among siblings
        foreach (var sibCode in siblingCodes)
        {
            if (int.TryParse(sibCode, out int sibCodeInt))
            {
                if (sibCodeInt > maxCode)
                    maxCode = sibCodeInt;
            }
        }

        // If no siblings exist, start from parent code + increment
        // Otherwise, start from max sibling code + increment
        int nextCode = maxCode == 0 ? parentCodeInt + increment : maxCode + increment;
        
        // Loop until we find a code that doesn't exist anywhere in the chart of accounts
        string candidate = nextCode.ToString();
        while (await _context.GetSet<Novologs.Domain.Entities.Account>()
            .IgnoreQueryFilters()
            .AnyAsync(a => a.Code == candidate, cancellationToken))
        {
            nextCode += increment;
            candidate = nextCode.ToString();
        }

        return candidate;
    }
}
