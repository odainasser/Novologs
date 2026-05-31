using Novologs.Application.Modules.Account.Transactions.Commands.CreateTransaction;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Microsoft.EntityFrameworkCore;
using System.Security;

namespace Novologs.Application.Modules.Account.Transactions.Commands.AddTransactionAttachments;

[AuthorizePermission(Permissions.Accounting.AddTransactionAttachment)]
public record AddTransactionAttachmentsCommand : IRequest<Result<bool>>
{
    public int TransactionId { get; init; }
    public List<AttachmentRequest> Attachments { get; init; } = new();
}

public class AddTransactionAttachmentsCommandHandler : IRequestHandler<AddTransactionAttachmentsCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public AddTransactionAttachmentsCommandHandler(ITenantDbContext context, IUser user)
    {
        _context = context;
        _user    = user;
    }

    public async Task<Result<bool>> Handle(AddTransactionAttachmentsCommand request, CancellationToken cancellationToken)
    {
        var transaction = await _context.GetSet<Novologs.Domain.Entities.AccountTransaction>()
            .FirstOrDefaultAsync(t => t.Id == request.TransactionId, cancellationToken);

        if (transaction is null)
            return Result<bool>.Failure("TXN_404_NOT_FOUND", "Transaction not found.");

        if (transaction.IsPosted)
            return Result<bool>.Failure("TXN_409_IS_POSTED", "Cannot modify a posted transaction.");

        foreach (var a in request.Attachments)
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

        await _context.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
