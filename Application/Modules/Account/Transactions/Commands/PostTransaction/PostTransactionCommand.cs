using Novologs.Application.Common.Models;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Transactions.Commands.PostTransaction;

[AuthorizePermission(Permissions.Accounting.PostTransaction)]
public record PostTransactionCommand : IRequest<Result<bool>>
{
    public int Id { get; init; }
}

public class PostTransactionCommandHandler : IRequestHandler<PostTransactionCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;

    public PostTransactionCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(PostTransactionCommand request, CancellationToken cancellationToken)
    {
        var transaction = await _context.GetSet<Novologs.Domain.Entities.AccountTransaction>()
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (transaction is null)
            return Result<bool>.Failure("TXN_404_NOT_FOUND", "Transaction not found.");

        if (transaction.IsPosted)
            return Result<bool>.Failure("TXN_409_IS_POSTED", "Transaction is already posted.");

        // BR6: Posting sets IsPosted = true and assigns the JV number if not already set
        if (string.IsNullOrWhiteSpace(transaction.ReferenceNo))
            transaction.ReferenceNo = await GenerateReferenceNoAsync(cancellationToken);

        transaction.IsPosted = true;
        transaction.PostedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }

    private async Task<string> GenerateReferenceNoAsync(CancellationToken cancellationToken)
    {
        var prefix = "JV-";

        var existing = await _context.GetSet<Novologs.Domain.Entities.AccountTransaction>()
            .Where(t => t.ReferenceNo != null && EF.Functions.Like(t.ReferenceNo, prefix + "%"))
            .Select(t => t.ReferenceNo)
            .ToListAsync(cancellationToken);

        var maxSeq = 0;
        var rx = new Regex($"^{Regex.Escape(prefix)}(\\d{{1,8}})$");
        foreach (var r in existing)
        {
            var m = rx.Match(r!);
            if (m.Success && int.TryParse(m.Groups[1].Value, out var v))
                maxSeq = Math.Max(maxSeq, v);
        }

        var next = maxSeq + 1;
        return prefix + next.ToString().PadLeft(8, '0');
    }
}
