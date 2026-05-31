using Novologs.Application.Modules.Account.Transactions.Commands.CreateTransaction;
using Novologs.Application.Modules.Account.Transactions.Commands.PostTransaction;
using MediatR;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Account.PurchaseInvoices.Commands.PostPurchaseInvoice;


[AuthorizePermission(Permissions.Accounting.PostPurchaseInvoice)]
public record PostPurchaseInvoiceCommand(int Id) : IRequest<Result<bool>>;

public class PostPurchaseInvoiceCommandHandler : IRequestHandler<PostPurchaseInvoiceCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;
    private readonly ISender _sender;

    public PostPurchaseInvoiceCommandHandler(ITenantDbContext context, ISender sender)
    {
        _context = context;
        _sender  = sender;
    }

    public async Task<Result<bool>> Handle(PostPurchaseInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _context.GetSet<Novologs.Domain.Entities.PurchaseInvoice>()
            .FirstOrDefaultAsync(i => i.Id == request.Id && !i.IsDeleted, cancellationToken);

        if (invoice is null)
            return Result<bool>.Failure("INV_404_NOT_FOUND", $"Purchase invoice with ID {request.Id} was not found.");

        if (invoice.Status != Novologs.Domain.Enums.PurchaseInvoiceStatus.Draft)
            return Result<bool>.Failure("INV_409_ALREADY_POSTED", "Purchase invoice has already been posted or cancelled.");

        if (invoice.GrandTotal <= 0)
            return Result<bool>.Failure("INV_400_ZERO_AMOUNT", "Cannot post an invoice with a zero or negative grand total.");

        if (invoice.DebitAccountId == Guid.Empty)
            return Result<bool>.Failure("INV_400_MISSING_DEBIT_ACCOUNT", "Debit account is not set on this invoice.");

        // Resolve credit account from VendorAccount table
        var vendorAccount = await _context.GetSet<Novologs.Domain.Entities.VendorAccount>()
            .FirstOrDefaultAsync(va => va.VendorId == invoice.VendorId, cancellationToken);

        if (vendorAccount is null)
            return Result<bool>.Failure("INV_404_VENDOR_ACCOUNT_NOT_FOUND",
                $"No GL account is linked to vendor {invoice.VendorId}. Please set up a vendor account first.");

        var creditAccountId = vendorAccount.AccountId;

        if (invoice.DebitAccountId == creditAccountId)
            return Result<bool>.Failure("INV_400_SAME_ACCOUNT", "Debit and credit accounts must be different.");

        // Validate debit account exists and is not deleted
        var debitAccountExists = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .AnyAsync(a => a.Id == invoice.DebitAccountId && !a.IsDeleted, cancellationToken);

        if (!debitAccountExists)
            return Result<bool>.Failure("INV_404_DEBIT_ACCOUNT_NOT_FOUND",
                $"Debit account with ID {invoice.DebitAccountId} was not found.");

        // Validate credit account exists and is not deleted
        var creditAccountExists = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .AnyAsync(a => a.Id == creditAccountId && !a.IsDeleted, cancellationToken);

        if (!creditAccountExists)
            return Result<bool>.Failure("INV_404_CREDIT_ACCOUNT_NOT_FOUND",
                $"Credit account with ID {creditAccountId} was not found.");

        // Step 1: Create the balanced journal entry via the existing command (IsPosted = false on creation)
        var createResult = await _sender.Send(new CreateTransactionCommand
        {
            Date        = DateTime.UtcNow,
            ReferenceNo = invoice.InvNumber,
            Description = $"Purchase Invoice {invoice.InvNumber}",
            Lines =
            [
                new CreateTransactionLineRequest
                {
                    AccountId   = invoice.DebitAccountId,
                    Debit       = invoice.GrandTotal,
                    Credit      = 0,
                    Description = $"Purchase Invoice {invoice.InvNumber} â€“ debit"
                },
                new CreateTransactionLineRequest
                {
                    AccountId   = creditAccountId,
                    Debit       = 0,
                    Credit      = invoice.GrandTotal,
                    Description = $"Purchase Invoice {invoice.InvNumber} â€“ credit"
                }
            ]
        }, cancellationToken);

        if (!createResult.Succeeded)
            return Result<bool>.Failure(createResult.Errors);

        // Step 2: Post the transaction (sets IsPosted = true)
        var postResult = await _sender.Send(new PostTransactionCommand { Id = createResult.SuccessStatus!.Id }, cancellationToken);

        if (!postResult.Succeeded)
            return Result<bool>.Failure(postResult.Errors);

        // Step 3: Update invoice status and link the transaction
        invoice.Status               = Novologs.Domain.Enums.PurchaseInvoiceStatus.Posted;
        invoice.AccountTransactionId = createResult.SuccessStatus.Id;

        // Mark linked PO as Invoiced
        if (invoice.PurchaseOrderId.HasValue)
        {
            var po = await _context.GetSet<Novologs.Domain.Entities.PurchaseOrder>()
                .FirstOrDefaultAsync(p => p.Id == invoice.PurchaseOrderId.Value && !p.IsDeleted, cancellationToken);

            if (po != null)
                po.Status = Novologs.Domain.Enums.PurchaseOrderStatus.Invoiced;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
