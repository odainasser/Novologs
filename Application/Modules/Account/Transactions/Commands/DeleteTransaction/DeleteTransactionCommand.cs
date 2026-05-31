using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Transactions.Commands.DeleteTransaction;

[AuthorizePermission(Permissions.Accounting.DeleteTransaction)]
public record DeleteTransactionCommand : IRequest<Result<bool>>
{
    public int Id { get; init; }
}

public class DeleteTransactionCommandHandler : IRequestHandler<DeleteTransactionCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly IFileUtileService _fileService;

    public DeleteTransactionCommandHandler(ITenantDbContext context, IFileUtileService fileService)
    {
        _context = context;
        _fileService = fileService;
    }

    public async Task<Result<bool>> Handle(DeleteTransactionCommand request, CancellationToken cancellationToken)
    {
        var transaction = await _context.GetSet<Novologs.Domain.Entities.AccountTransaction>()
            .Include(t => t.Lines)
            .Include(t => t.Attachments)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (transaction is null)
            return Result<bool>.Failure("TXN_404_NOT_FOUND", "Transaction not found.");

        // BR4: Cannot delete a posted transaction
        if (transaction.IsPosted)
            return Result<bool>.Failure("TXN_409_IS_POSTED", "Cannot delete a posted transaction.");

        // Delete associated files from storage
        if (transaction.Attachments?.Any() == true)
        {
            foreach (var attachment in transaction.Attachments)
            {
                if (!string.IsNullOrEmpty(attachment.FilePath))
                {
                    try
                    {
                        await _fileService.DeleteFile(attachment.FilePath);
                    }
                    catch
                    {
                        // Log error or ignore if file already missing
                    }
                }
            }
        }

        _context.GetSet<Novologs.Domain.Entities.AccountTransactionLine>()
            .RemoveRange(transaction.Lines);

        if (transaction.Attachments?.Any() == true)
        {
            _context.GetSet<Novologs.Domain.Entities.AccountTransactionAttachment>()
                .RemoveRange(transaction.Attachments);
        }

        _context.GetSet<Novologs.Domain.Entities.AccountTransaction>()
            .Remove(transaction);

        await _context.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
