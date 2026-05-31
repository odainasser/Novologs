using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Account.SalesInvoices.Commands.PostSalesInvoice;

[AuthorizePermission(Permissions.Accounting.PostSalesInvoice)]
public record PostSalesInvoiceCommand(int Id) : IRequest<Result<bool>>;

public class PostSalesInvoiceCommandHandler : IRequestHandler<PostSalesInvoiceCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public PostSalesInvoiceCommandHandler(ITenantDbContext context, IUser user)
    {
        _context = context;
        _user    = user;
    }

    public async Task<Result<bool>> Handle(PostSalesInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _context.GetSet<Novologs.Domain.Entities.SalesInvoice>()
            .FirstOrDefaultAsync(i => i.Id == request.Id && !i.IsDeleted, cancellationToken);

        if (invoice is null)
            return Result<bool>.Failure("SINV_404_NOT_FOUND", $"Sales invoice with ID {request.Id} was not found.");

        if (invoice.Status != Novologs.Domain.Enums.SalesInvoiceStatus.Draft)
            return Result<bool>.Failure("SINV_409_ALREADY_POSTED", "Sales invoice has already been posted or cancelled.");

        if (invoice.GrandTotal <= 0)
            return Result<bool>.Failure("SINV_400_ZERO_AMOUNT", "Cannot post an invoice with a zero or negative grand total.");

        // Validate debit account
        var debitAccount = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .FirstOrDefaultAsync(a => a.Id == invoice.DebitAccountId && !a.IsDeleted, cancellationToken);

        if (debitAccount is null)
            return Result<bool>.Failure("SINV_404_DEBIT_ACCOUNT_NOT_FOUND",
                $"Debit account with ID {invoice.DebitAccountId} was not found.");

        // Validate credit account
        var creditAccount = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .FirstOrDefaultAsync(a => a.Id == invoice.CreditAccountId && !a.IsDeleted, cancellationToken);

        if (creditAccount is null)
            return Result<bool>.Failure("SINV_404_CREDIT_ACCOUNT_NOT_FOUND",
                $"Credit account with ID {invoice.CreditAccountId} was not found.");

        // Create balanced journal entry
        var transaction = new Novologs.Domain.Entities.AccountTransaction
        {
            Date        = DateTime.UtcNow,
            ReferenceNo = invoice.InvNumber,
            Description = $"Sales Invoice {invoice.InvNumber}",
            IsPosted    = true,
            CreatedAt   = DateTime.UtcNow,
            CreatedBy   = _user.Id ?? "system",
            Lines = new List<Novologs.Domain.Entities.AccountTransactionLine>
            {
                new()
                {
                    AccountId   = invoice.DebitAccountId,
                    Debit       = invoice.GrandTotal,
                    Credit      = 0,
                    Description = $"Sales Invoice {invoice.InvNumber} â€“ debit"
                },
                new()
                {
                    AccountId   = invoice.CreditAccountId,
                    Debit       = 0,
                    Credit      = invoice.GrandTotal,
                    Description = $"Sales Invoice {invoice.InvNumber} â€“ credit"
                }
            }
        };

        await _context.GetSet<Novologs.Domain.Entities.AccountTransaction>().AddAsync(transaction, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Update invoice status
        invoice.Status               = Novologs.Domain.Enums.SalesInvoiceStatus.Posted;
        invoice.AccountTransactionId = transaction.Id;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
