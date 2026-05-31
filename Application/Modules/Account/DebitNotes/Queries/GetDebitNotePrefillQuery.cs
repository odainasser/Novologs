using Novologs.Application.Modules.Account.DebitNotes.DTOs;
using Novologs.Application.Modules.Account.PurchaseOrders.DTOs;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.DebitNotes.Queries.GetDebitNotePrefill;

[AuthorizePermission(Permissions.Accounting.ReadPurchaseInvoice)]
public record GetDebitNotePrefillQuery(int PurchaseInvoiceId) : IRequest<Result<DebitNoteDto>>;

public class GetDebitNotePrefillQueryHandler : IRequestHandler<GetDebitNotePrefillQuery, Result<DebitNoteDto>>
{
    private readonly ITenantDbContext _context;

    public GetDebitNotePrefillQueryHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DebitNoteDto>> Handle(GetDebitNotePrefillQuery request, CancellationToken cancellationToken)
    {
        var invoice = await _context.GetSet<Novologs.Domain.Entities.PurchaseInvoice>()
            .Include(i => i.Items)
                .ThenInclude(item => item.Product)
                    .ThenInclude(p => p!.Name)
                        .ThenInclude(n => n.LocalizedStrings)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == request.PurchaseInvoiceId && !i.IsDeleted, cancellationToken);

        if (invoice is null)
            return Result<DebitNoteDto>.Failure("DN_404_PURCHASE_INVOICE_NOT_FOUND",
                $"Purchase invoice with ID {request.PurchaseInvoiceId} was not found.");

        // GL accounts are reversed: what was DR on the invoice becomes CR on the debit note
        var dto = new DebitNoteDto
        {
            VendorId          = invoice.VendorId,
            Currency          = invoice.Currency,
            InvoiceType       = invoice.InvoiceType,
            BillingAddress    = invoice.BillingAddress,
            Location          = invoice.Location,
            Terms             = invoice.Terms,
            NoteDate          = DateTime.UtcNow,
            OurRef            = invoice.OurRef,
            YourRef           = invoice.YourRef,
            PurchaseInvoiceId = invoice.Id,
            // Reversed GL accounts
            DebitAccountId    = invoice.CreditAccountId,
            CreditAccountId   = invoice.DebitAccountId,
            OverallDiscountType  = invoice.OverallDiscountType,
            OverallDiscountValue = invoice.OverallDiscountValue,
            Subtotal                  = invoice.Subtotal,
            TotalLineDiscount         = invoice.TotalLineDiscount,
            SubtotalAfterLineDiscounts = invoice.SubtotalAfterLineDiscounts,
            OverallDiscountAmount     = invoice.OverallDiscountAmount,
            TotalTaxableAmount        = invoice.TotalTaxableAmount,
            TotalTax                  = invoice.TotalTax,
            GrandTotal                = invoice.GrandTotal,
            Items = invoice.Items.Select(i => new DebitNoteItemDto
            {
                Product = i.Product != null ? new ProductSummaryDto
                {
                    Id    = i.Product.Id,
                    Value = i.Product.Name.Value,
                    LocalizedStrings = i.Product.Name.LocalizedStrings
                        .Select(ls => new LocalizedStringItemDto { Language = ls.Language, Value = ls.Value })
                        .ToList()
                } : null,
                Quantity              = i.Quantity,
                UnitPrice             = i.UnitPrice,
                LineDiscountType      = i.LineDiscountType,
                LineDiscountValue     = i.LineDiscountValue,
                LineDiscountPercent   = i.LineDiscountType == DiscountType.Percentage ? i.LineDiscountValue : 0m,
                TaxPercent            = i.TaxPercent,
                LineBase              = i.LineBase,
                LineDiscountAmount    = i.LineDiscountAmount,
                TaxableAmount         = i.TaxableAmount,
                AllocatedOverallDiscount = i.AllocatedOverallDiscount,
                FinalTaxableAmount    = i.FinalTaxableAmount,
                TaxAmount             = i.TaxAmount,
                LineTotal             = i.LineTotal,
            }).ToList()
        };

        return Result<DebitNoteDto>.Success(dto);
    }
}
