using Novologs.Application.Modules.Account.Transactions.Commands.CreateTransaction;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Account.Transactions.Commands.UpdateTransaction;

[AuthorizePermission(Permissions.Accounting.UpdateTransaction)]
public record UpdateTransactionCommand : IRequest<Result<bool>>
{
    public int Id { get; init; }
    public DateTime Date { get; init; }
    public string ReferenceNo { get; init; } = default!;
    public string Description { get; init; } = default!;
    public List<CreateTransactionLineRequest> Lines { get; init; } = new();
    public List<AttachmentRequest>? NewAttachments { get; init; }
    public List<int>? AttachmentIdsToDelete { get; init; }
}

public class UpdateTransactionCommandHandler : IRequestHandler<UpdateTransactionCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public UpdateTransactionCommandHandler(ITenantDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<Result<bool>> Handle(UpdateTransactionCommand request, CancellationToken cancellationToken)
    {
        var transaction = await _context.GetSet<Novologs.Domain.Entities.AccountTransaction>()
            .Include(t => t.Lines)
            .Include(t => t.Attachments)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (transaction is null)
            return Result<bool>.Failure("TXN_404_NOT_FOUND", "Transaction not found.");

        // BR4: Cannot edit posted transaction
        if (transaction.IsPosted)
            return Result<bool>.Failure("TXN_409_IS_POSTED", "Cannot edit a posted transaction.");

        // BR1: At least 2 lines
        if (request.Lines.Count < 2)
            return Result<bool>.Failure("TXN_400_MIN_LINES", "A transaction must have at least 2 lines.");

        // BR3: Each line Debit or Credit > 0, not both
        foreach (var line in request.Lines)
        {
            if (line.Debit < 0 || line.Credit < 0)
                return Result<bool>.Failure("TXN_400_NEGATIVE", "Debit and Credit amounts cannot be negative.");

            if (line.Debit == 0 && line.Credit == 0)
                return Result<bool>.Failure("TXN_400_ZERO_LINE", "Each line must have Debit > 0 or Credit > 0.");

            if (line.Debit > 0 && line.Credit > 0)
                return Result<bool>.Failure("TXN_400_BOTH", "A line cannot have both Debit and Credit > 0.");
        }

        // BR1: Total Debit must equal Total Credit
        var totalDebit  = request.Lines.Sum(l => l.Debit);
        var totalCredit = request.Lines.Sum(l => l.Credit);
        if (totalDebit != totalCredit)
            return Result<bool>.Failure("TXN_400_UNBALANCED",
                $"Total Debit ({totalDebit}) must equal Total Credit ({totalCredit}).");

        // BR5: Only level-3 (leaf) accounts
        var accountIds = request.Lines.Select(l => l.AccountId).Distinct().ToList();
        var accounts = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .Where(a => accountIds.Contains(a.Id) && !a.IsDeleted)
            .ToListAsync(cancellationToken);

        var missingAccountId = accountIds.FirstOrDefault(id => accounts.All(a => a.Id != id));
        if (missingAccountId != default)
            return Result<bool>.Failure("TXN_404_ACCOUNT", $"Account '{missingAccountId}' not found.");


        // Reject accounts above level 5
        var invalidLevelAccount = accounts.FirstOrDefault(a => a.Level > 5);
        if (invalidLevelAccount != null)
            return Result<bool>.Failure("TXN_400_NON_LEAF",
                $"Account '{invalidLevelAccount.Code} - {invalidLevelAccount.Name}' is level {invalidLevelAccount.Level}. Only accounts up to level-5 can be used in transactions.");

        // Apply updates
        transaction.Date        = request.Date;
        // Keep the existing reference number when the caller omits / blanks the field.
        if (!string.IsNullOrWhiteSpace(request.ReferenceNo))
            transaction.ReferenceNo = request.ReferenceNo;
        transaction.Description = request.Description ?? string.Empty;

        // Replace lines
        _context.GetSet<Novologs.Domain.Entities.AccountTransactionLine>()
            .RemoveRange(transaction.Lines);

        transaction.Lines = request.Lines.Select(l => new Novologs.Domain.Entities.AccountTransactionLine
        {
            TransactionId = transaction.Id,
            AccountId     = l.AccountId,
            Debit         = l.Debit,
            Credit        = l.Credit,
            Description   = l.Description
        }).ToList();

        // Remove attachments flagged for deletion
        if (request.AttachmentIdsToDelete?.Count > 0)
        {
            var toRemove = transaction.Attachments
                .Where(a => request.AttachmentIdsToDelete.Contains(a.Id))
                .ToList();
            _context.GetSet<Novologs.Domain.Entities.AccountTransactionAttachment>().RemoveRange(toRemove);
        }

        // Add new attachments
        if (request.NewAttachments?.Count > 0)
        {
            foreach (var a in request.NewAttachments)
            {
                await _context.GetSet<Novologs.Domain.Entities.AccountTransactionAttachment>().AddAsync(
                    new Novologs.Domain.Entities.AccountTransactionAttachment
                    {
                        TransactionId = transaction.Id,
                        FileName      = a.FileName,
                        FileUrl       = a.FileUrl,
                        FilePath      = a.FilePath,
                        MimeType      = a.MimeType,
                        FileSize      = a.FileSize,
                        UploadedAt    = DateTime.UtcNow,
                        UploadedBy    = _user.Id ?? "system"
                    }, cancellationToken);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
