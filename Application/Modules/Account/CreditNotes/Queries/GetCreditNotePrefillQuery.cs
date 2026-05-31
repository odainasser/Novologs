using Novologs.Application.Modules.Account.CreditNotes.DTOs;
using Novologs.Application.Modules.Account.PurchaseOrders.DTOs;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.CreditNotes.Queries.GetCreditNotePrefill;

[AuthorizePermission(Permissions.Accounting.ReadSalesInvoice)]
public record GetCreditNotePrefillQuery(int SalesInvoiceId) : IRequest<Result<CreditNoteDto>>;

public class GetCreditNotePrefillQueryHandler : IRequestHandler<GetCreditNotePrefillQuery, Result<CreditNoteDto>>
{
    private readonly ITenantDbContext _context;

    public GetCreditNotePrefillQueryHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CreditNoteDto>> Handle(GetCreditNotePrefillQuery request, CancellationToken cancellationToken)
    {
        var invoice = await _context.GetSet<Novologs.Domain.Entities.SalesInvoice>()
            .Include(i => i.Items)
                .ThenInclude(item => item.Product)
                    .ThenInclude(p => p!.Name)
                        .ThenInclude(n => n.LocalizedStrings)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == request.SalesInvoiceId && !i.IsDeleted, cancellationToken);

        if (invoice is null)
            return Result<CreditNoteDto>.Failure("CN_404_SALES_INVOICE_NOT_FOUND",
                $"Sales invoice with ID {request.SalesInvoiceId} was not found.");

        // GL accounts are reversed: what was DR on the invoice becomes CR on the credit note
        var dto = new CreditNoteDto
        {
            ClientId          = invoice.ClientId,
            Currency          = invoice.Currency,
            InvoiceType       = invoice.InvoiceType,
            BillingAddress    = invoice.BillingAddress,
            Location          = invoice.Location,
            Terms             = invoice.Terms,
            NoteDate          = DateTime.UtcNow,
            OurRef            = invoice.OurRef,
            YourRef           = invoice.YourRef,
            SalesInvoiceId    = invoice.Id,
            // Reversed GL accounts
            DebitAccountId    = invoice.CreditAccountId,
            CreditAccountId   = invoice.DebitAccountId,
            OverallDiscountType  = invoice.OverallDiscountType,
            OverallDiscountValue = invoice.OverallDiscountValue,
            Subtotal                   = invoice.Subtotal,
            TotalLineDiscount          = invoice.TotalLineDiscount,
            SubtotalAfterLineDiscounts = invoice.SubtotalAfterLineDiscounts,
            OverallDiscountAmount      = invoice.OverallDiscountAmount,
            TotalTaxableAmount         = invoice.TotalTaxableAmount,
            TotalTax                   = invoice.TotalTax,
            GrandTotal                 = invoice.GrandTotal,
            Items = invoice.Items.Select(i => new CreditNoteItemDto
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

        return Result<CreditNoteDto>.Success(dto);
    }
}
