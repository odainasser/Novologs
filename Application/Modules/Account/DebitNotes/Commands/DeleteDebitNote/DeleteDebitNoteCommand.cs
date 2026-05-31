using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.DebitNotes.Commands.DeleteDebitNote;

[AuthorizePermission(Permissions.Accounting.DeleteDebitNote)]
public record DeleteDebitNoteCommand(int Id) : IRequest<Result<bool>>;

public class DeleteDebitNoteCommandHandler : IRequestHandler<DeleteDebitNoteCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;

    public DeleteDebitNoteCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteDebitNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await _context.GetSet<Novologs.Domain.Entities.DebitNote>()
            .FirstOrDefaultAsync(n => n.Id == request.Id && !n.IsDeleted, cancellationToken);

        if (note is null)
            return Result<bool>.Failure("DN_404_NOT_FOUND", $"Debit note with ID {request.Id} was not found.");

        if (note.Status != Novologs.Domain.Enums.DebitNoteStatus.Draft)
            return Result<bool>.Failure("DN_409_NOT_DRAFT", "Only Draft debit notes can be deleted.");

        note.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
