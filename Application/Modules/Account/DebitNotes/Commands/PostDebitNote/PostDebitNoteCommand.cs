using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Account.DebitNotes.Commands.PostDebitNote;

[AuthorizePermission(Permissions.Accounting.PostDebitNote)]
public record PostDebitNoteCommand(int Id) : IRequest<Result<bool>>;

public class PostDebitNoteCommandHandler : IRequestHandler<PostDebitNoteCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public PostDebitNoteCommandHandler(ITenantDbContext context, IUser user)
    {
        _context = context;
        _user    = user;
    }

    public async Task<Result<bool>> Handle(PostDebitNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await _context.GetSet<Novologs.Domain.Entities.DebitNote>()
            .FirstOrDefaultAsync(n => n.Id == request.Id && !n.IsDeleted, cancellationToken);

        if (note is null)
            return Result<bool>.Failure("DN_404_NOT_FOUND", $"Debit note with ID {request.Id} was not found.");

        if (note.Status != Novologs.Domain.Enums.DebitNoteStatus.Draft)
            return Result<bool>.Failure("DN_409_ALREADY_POSTED", "Debit note has already been posted or cancelled.");

        if (note.GrandTotal <= 0)
            return Result<bool>.Failure("DN_400_ZERO_AMOUNT", "Cannot post a debit note with a zero or negative grand total.");

        var debitAccount = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .FirstOrDefaultAsync(a => a.Id == note.DebitAccountId && !a.IsDeleted, cancellationToken);

        if (debitAccount is null)
            return Result<bool>.Failure("DN_404_DEBIT_ACCOUNT_NOT_FOUND",
                $"Debit account with ID {note.DebitAccountId} was not found.");

        var creditAccount = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .FirstOrDefaultAsync(a => a.Id == note.CreditAccountId && !a.IsDeleted, cancellationToken);

        if (creditAccount is null)
            return Result<bool>.Failure("DN_404_CREDIT_ACCOUNT_NOT_FOUND",
                $"Credit account with ID {note.CreditAccountId} was not found.");

        if (note.DebitAccountId == note.CreditAccountId)
            return Result<bool>.Failure("DN_400_SAME_ACCOUNTS", "Debit and credit accounts must be different.");

        // Create balanced journal entry (reversed relative to the source Purchase Invoice)
        var transaction = new Novologs.Domain.Entities.AccountTransaction
        {
            Date        = DateTime.UtcNow,
            ReferenceNo = note.NoteNumber,
            Description = $"Debit Note {note.NoteNumber}",
            IsPosted    = true,
            CreatedAt   = DateTime.UtcNow,
            CreatedBy   = _user.Id ?? "system",
            Lines = new List<Novologs.Domain.Entities.AccountTransactionLine>
            {
                new()
                {
                    AccountId   = note.DebitAccountId,
                    Debit       = note.GrandTotal,
                    Credit      = 0,
                    Description = $"Debit Note {note.NoteNumber} â€“ debit"
                },
                new()
                {
                    AccountId   = note.CreditAccountId,
                    Debit       = 0,
                    Credit      = note.GrandTotal,
                    Description = $"Debit Note {note.NoteNumber} â€“ credit"
                }
            }
        };

        await _context.GetSet<Novologs.Domain.Entities.AccountTransaction>().AddAsync(transaction, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        note.Status               = Novologs.Domain.Enums.DebitNoteStatus.Posted;
        note.AccountTransactionId = transaction.Id;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
