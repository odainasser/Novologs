using Novologs.Application.Modules.Account.Transactions.DTOs;
using Novologs.Application.Modules.Account.Transactions.Interfaces;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace Novologs.Application.Modules.Account.Transactions.Commands.CreateTransaction;

public class CreateTransactionLineRequest
{
    public Guid AccountId { get; init; }
    public decimal Debit { get; init; }
    public decimal Credit { get; init; }
    public string? Description { get; init; }
}

public class AttachmentRequest
{
    public string FileName { get; init; } = default!;
    public string FileUrl { get; init; } = default!;
    public string FilePath { get; init; } = default!;
    public string? MimeType { get; init; }
    public long? FileSize { get; init; }
}

public record CreateTransactionResponse(int Id);


[AuthorizePermission(Permissions.Accounting.AddTransaction)]
public record CreateTransactionCommand : IRequest<Result<CreateTransactionResponse>>
{
    public DateTime Date { get; init; }
    public string? ReferenceNo { get; init; }
    public string Description { get; init; } = default!;
    public List<CreateTransactionLineRequest> Lines { get; init; } = new();
    public List<AttachmentRequest>? Attachments { get; init; }
}

public class CreateTransactionCommandHandler : IRequestHandler<CreateTransactionCommand, Result<CreateTransactionResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public CreateTransactionCommandHandler(ITenantDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<Result<CreateTransactionResponse>> Handle(CreateTransactionCommand request, CancellationToken cancellationToken)
    {
        // BR1: At least 2 lines
        if (request.Lines.Count < 2)
            return Result<CreateTransactionResponse>.Failure("TXN_400_MIN_LINES", "A transaction must have at least 2 lines.");

        // BR3: Each line must have either Debit > 0 or Credit > 0, not both, not neither
        foreach (var line in request.Lines)
        {
            if (line.Debit < 0 || line.Credit < 0)
                return Result<CreateTransactionResponse>.Failure("TXN_400_NEGATIVE", "Debit and Credit amounts cannot be negative.");

            if (line.Debit == 0 && line.Credit == 0)
                return Result<CreateTransactionResponse>.Failure("TXN_400_ZERO_LINE", "Each line must have Debit > 0 or Credit > 0.");

            if (line.Debit > 0 && line.Credit > 0)
                return Result<CreateTransactionResponse>.Failure("TXN_400_BOTH", "A line cannot have both Debit and Credit > 0.");
        }

        // BR1: Total Debit must equal Total Credit
        var totalDebit  = request.Lines.Sum(l => l.Debit);
        var totalCredit = request.Lines.Sum(l => l.Credit);
        if (totalDebit != totalCredit)
            return Result<CreateTransactionResponse>.Failure("TXN_400_UNBALANCED",
                $"Total Debit ({totalDebit}) must equal Total Credit ({totalCredit}).");


        // BR5: Only accounts up to level-5 (leaf) can be used
        var accountIds = request.Lines.Select(l => l.AccountId).Distinct().ToList();
        var accounts = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .Where(a => accountIds.Contains(a.Id) && !a.IsDeleted)
            .ToListAsync(cancellationToken);

        var missingAccountId = accountIds.FirstOrDefault(id => accounts.All(a => a.Id != id));
        if (missingAccountId != default)
            return Result<CreateTransactionResponse>.Failure("TXN_404_ACCOUNT",
                $"Account '{missingAccountId}' not found.");

        // Reject accounts above level 5
        var invalidLevelAccount = accounts.FirstOrDefault(a => a.Level > 5);
        if (invalidLevelAccount != null)
            return Result<CreateTransactionResponse>.Failure("TXN_400_NON_LEAF",
                $"Account '{invalidLevelAccount.Code} - {invalidLevelAccount.Name}' is level {invalidLevelAccount.Level}. Only accounts up to level-5 can be used in transactions.");

        // Reject accounts that are marked as a subcategory but have no parent
        var invalidSubcategory = accounts.FirstOrDefault(a => a.IsSubcategory && a.ParentAccountId == null);
        if (invalidSubcategory != null)
            return Result<CreateTransactionResponse>.Failure("TXN_400_INVALID_SUBCATEGORY",
                $"Account '{invalidSubcategory.Code} - {invalidSubcategory.Name}' is marked as a subcategory. Such accounts cannot be used in transactions.");

        // Ensure the transaction date is treated as UTC when saving to timestamptz columns
        var txnDate = DateTime.SpecifyKind(request.Date, DateTimeKind.Utc);

        // Check if a transaction with the same ReferenceNo already exists (if provided)
        if (!string.IsNullOrWhiteSpace(request.ReferenceNo))
        {
            var exists = await _context.GetSet<Novologs.Domain.Entities.AccountTransaction>()
                .AnyAsync(t => t.ReferenceNo == request.ReferenceNo, cancellationToken);

            if (exists)
                return Result<CreateTransactionResponse>.Failure("TXN_409_DUPLICATE",
                    $"A transaction with Reference No '{request.ReferenceNo}' already exists.");
        }

        // BR: Prevent duplicate transactions for the same account on the same day with the same total
        var dayStart = txnDate.Date;
        var dayEnd = dayStart.AddDays(1);
        var totalAmount = request.Lines.Sum(l => l.Debit + l.Credit);

        foreach (var accountId in accountIds)
        {
            var accountLineTotal = request.Lines
                .Where(rl => rl.AccountId == accountId)
                .Sum(rl => rl.Debit + rl.Credit);

            var duplicateExists = await _context.GetSet<Novologs.Domain.Entities.AccountTransaction>()
                .AnyAsync(t => t.Date >= dayStart && t.Date < dayEnd &&
                               t.Lines.Any(l => l.AccountId == accountId && (l.Debit + l.Credit) == accountLineTotal),
                               cancellationToken);

            if (duplicateExists)
            {
                var account = accounts.First(a => a.Id == accountId);
                return Result<CreateTransactionResponse>.Failure("TXN_409_DUPLICATE_ACCOUNT_ENTRY",
                    $"A similar transaction entry for account '{account.Name}' already exists for this date. Please check for potential duplicates.");
            }
        }

        var transaction = new Novologs.Domain.Entities.AccountTransaction
        {
            Date        = txnDate,
            ReferenceNo = string.IsNullOrWhiteSpace(request.ReferenceNo) ? null : request.ReferenceNo,
            Description = request.Description,
            IsPosted    = false,
            CreatedAt   = DateTime.UtcNow,
            CreatedBy   = _user.Id ?? "system",
            Lines       = request.Lines.Select(l => new Novologs.Domain.Entities.AccountTransactionLine
            {
                AccountId   = l.AccountId,
                Debit       = l.Debit,
                Credit      = l.Credit,
                Description = l.Description
            }).ToList(),
            Attachments = (request.Attachments ?? new List<AttachmentRequest>())
                .Select(a => new Novologs.Domain.Entities.AccountTransactionAttachment
                {
                    FileName   = a.FileName,
                    FileUrl    = a.FileUrl,
                    FilePath   = a.FilePath,
                    MimeType   = a.MimeType,
                    FileSize   = a.FileSize,
                    UploadedAt = DateTime.UtcNow,
                    UploadedBy = _user.Id ?? "system"
                }).ToList()
        };

        await _context.GetSet<Novologs.Domain.Entities.AccountTransaction>().AddAsync(transaction, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<CreateTransactionResponse>.Success(new CreateTransactionResponse(transaction.Id));
    }

}
