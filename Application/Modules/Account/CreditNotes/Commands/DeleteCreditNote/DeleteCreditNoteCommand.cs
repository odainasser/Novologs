using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.CreditNotes.Commands.DeleteCreditNote;

[AuthorizePermission(Permissions.Accounting.DeleteCreditNote)]
public record DeleteCreditNoteCommand(int Id) : IRequest<Result<bool>>;

public class DeleteCreditNoteCommandHandler : IRequestHandler<DeleteCreditNoteCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;

    public DeleteCreditNoteCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteCreditNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await _context.GetSet<Novologs.Domain.Entities.CreditNote>()
            .FirstOrDefaultAsync(n => n.Id == request.Id && !n.IsDeleted, cancellationToken);

        if (note is null)
            return Result<bool>.Failure("CN_404_NOT_FOUND", $"Credit note with ID {request.Id} was not found.");

        if (note.Status != Novologs.Domain.Enums.CreditNoteStatus.Draft)
            return Result<bool>.Failure("CN_409_NOT_DRAFT", "Only Draft credit notes can be deleted.");

        note.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
