using System.Text.RegularExpressions;
using Novologs.Application.Modules.Account.DebitNotes.DTOs;
using Novologs.Application.Modules.Account.DebitNotes.Interfaces;
using Novologs.Application.Modules.Account.PurchaseOrders.DTOs;
using Novologs.Application.Modules.Account.PurchaseOrders.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.DebitNotes.Commands.CreateDebitNote;

public class CreateDebitNoteItemRequest
{
    public int ProductId { get; init; }
    public UnitRequest? Unit { get; init; }
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public DiscountType LineDiscountType { get; init; }
    public decimal LineDiscountValue { get; init; } = 0;
    public decimal TaxPercent { get; init; } = 0;
}

public record CreateDebitNoteResponse(int Id, string NoteNumber);

[AuthorizePermission(Permissions.Accounting.AddDebitNote)]
public record CreateDebitNoteCommand : IRequest<Result<CreateDebitNoteResponse>>
{
    public Guid VendorId { get; init; }
    public string Currency { get; init; } = default!;
    public InvoiceType InvoiceType { get; init; } = InvoiceType.TaxCashInvoice;
    public string? BillingAddress { get; init; }
    public string? Location { get; init; }
    public string? Terms { get; init; }
    public DateTime NoteDate { get; init; }
    public DateTime? DueDate { get; init; }
    public string? OurRef { get; init; }
    public string? YourRef { get; init; }
    public string? MessageOnNote { get; init; }
    /// <summary>Required when no PurchaseInvoiceId is supplied.</summary>
    public Guid? DebitAccountId { get; init; }
    /// <summary>Required when no PurchaseInvoiceId is supplied.</summary>
    public Guid? CreditAccountId { get; init; }
    /// <summary>Optional link to a source Purchase Invoice. When supplied and Items is empty, items are copied from the invoice.</summary>
    public int? PurchaseInvoiceId { get; init; }
    public DiscountType OverallDiscountType { get; init; } = DiscountType.Percentage;
    public decimal OverallDiscountValue { get; init; } = 0;
    public List<CreateDebitNoteItemRequest> Items { get; init; } = new();
}

public class CreateDebitNoteCommandHandler : IRequestHandler<CreateDebitNoteCommand, Result<CreateDebitNoteResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IDebitNoteRepository _repository;
    private readonly IUser _user;

    public CreateDebitNoteCommandHandler(
        ITenantDbContext context,
        IDebitNoteRepository repository,
        IUser user)
    {
        _context    = context;
        _repository = repository;
        _user       = user;
    }

    public async Task<Result<CreateDebitNoteResponse>> Handle(CreateDebitNoteCommand request, CancellationToken cancellationToken)
    {
        Guid debitAccountId;
        Guid creditAccountId;
        List<CreateDebitNoteItemRequest> items = request.Items.ToList();

        // Resolve GL accounts and optionally copy items from the linked Purchase Invoice
        if (request.PurchaseInvoiceId.HasValue)
        {
            var pi = await _context.GetSet<Novologs.Domain.Entities.PurchaseInvoice>()
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == request.PurchaseInvoiceId.Value && !i.IsDeleted, cancellationToken);

            if (pi is null)
                return Result<CreateDebitNoteResponse>.Failure("DN_404_PURCHASE_INVOICE_NOT_FOUND",
                    $"Purchase invoice with ID {request.PurchaseInvoiceId.Value} was not found.");

            // Auto-reverse GL accounts from PI when not explicitly provided
            debitAccountId  = request.DebitAccountId  ?? pi.CreditAccountId;
            creditAccountId = request.CreditAccountId ?? pi.DebitAccountId;

            // Auto-copy items from PI when none supplied
            if (items.Count == 0)
            {
                items = pi.Items.Select(i => new CreateDebitNoteItemRequest
                {
                    ProductId         = i.ProductId,
                    Unit              = i.Unit != null ? new UnitRequest { Value = i.Unit } : null,
                    Quantity          = i.Quantity,
                    UnitPrice         = i.UnitPrice,
                    LineDiscountType  = i.LineDiscountType,
                    LineDiscountValue = i.LineDiscountValue,
                    TaxPercent        = i.TaxPercent
                }).ToList();
            }
        }
        else
        {
            // Standalone â€” both accounts must be supplied explicitly
            if (!request.DebitAccountId.HasValue || request.DebitAccountId.Value == Guid.Empty)
                return Result<CreateDebitNoteResponse>.Failure("DN_400_DEBIT_ACCOUNT_REQUIRED",
                    "DebitAccountId is required when no PurchaseInvoiceId is supplied.");

            if (!request.CreditAccountId.HasValue || request.CreditAccountId.Value == Guid.Empty)
                return Result<CreateDebitNoteResponse>.Failure("DN_400_CREDIT_ACCOUNT_REQUIRED",
                    "CreditAccountId is required when no PurchaseInvoiceId is supplied.");

            debitAccountId  = request.DebitAccountId.Value;
            creditAccountId = request.CreditAccountId.Value;
        }

        if (items.Count == 0)
            return Result<CreateDebitNoteResponse>.Failure("DN_400_NO_ITEMS",
                "At least one line item is required.");

        // Validate accounts exist
        var debitAccountExists = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .AnyAsync(a => a.Id == debitAccountId && !a.IsDeleted, cancellationToken);

        if (!debitAccountExists)
            return Result<CreateDebitNoteResponse>.Failure("DN_404_DEBIT_ACCOUNT_NOT_FOUND",
                $"Debit account with ID {debitAccountId} was not found.");

        var creditAccountExists = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .AnyAsync(a => a.Id == creditAccountId && !a.IsDeleted, cancellationToken);

        if (!creditAccountExists)
            return Result<CreateDebitNoteResponse>.Failure("DN_404_CREDIT_ACCOUNT_NOT_FOUND",
                $"Credit account with ID {creditAccountId} was not found.");

        if (debitAccountId == creditAccountId)
            return Result<CreateDebitNoteResponse>.Failure("DN_400_SAME_ACCOUNTS",
                "Debit and credit accounts must be different.");

        // Validate products
        var productIds = items.Select(i => i.ProductId).Distinct().ToList();
        var products   = await _context.GetSet<Novologs.Domain.Entities.Product>()
            .Include(p => p.Name)
            .Where(p => productIds.Contains(p.Id) && !p.IsDeleted)
            .ToListAsync(cancellationToken);

        var missingProductId = productIds.FirstOrDefault(id => products.All(p => p.Id != id));
        if (missingProductId != default)
            return Result<CreateDebitNoteResponse>.Failure("DN_404_PRODUCT_NOT_FOUND",
                $"Product with ID {missingProductId} was not found.");

        var inactiveProduct = products.FirstOrDefault(p => !p.IsActive);
        if (inactiveProduct != null)
            return Result<CreateDebitNoteResponse>.Failure("DN_400_PRODUCT_INACTIVE",
                $"Product '{inactiveProduct.Name.Value}' is inactive and cannot be used in a debit note.");

        // Run calculations
        var itemInputs = items.Select(i => new PurchaseOrderCalculator.ItemInput(
            i.Quantity,
            i.UnitPrice,
            i.LineDiscountType,
            i.LineDiscountValue,
            i.TaxPercent)).ToList();

        var calc = PurchaseOrderCalculator.Calculate(itemInputs, request.OverallDiscountType, request.OverallDiscountValue);

        for (var idx = 0; idx < calc.Items.Count; idx++)
        {
            var r = calc.Items[idx];
            if (r.LineDiscountAmount > r.LineBase)
                return Result<CreateDebitNoteResponse>.Failure("DN_400_LINE_DISCOUNT_EXCEEDS",
                    $"Line {idx + 1}: discount amount ({r.LineDiscountAmount}) exceeds line base ({r.LineBase}).");
        }

        if (calc.OverallDiscountAmount > calc.SubtotalAfterLineDiscounts)
            return Result<CreateDebitNoteResponse>.Failure("DN_400_OVERALL_DISCOUNT_EXCEEDS",
                $"Overall discount ({calc.OverallDiscountAmount}) exceeds subtotal after line discounts ({calc.SubtotalAfterLineDiscounts}).");

        var noteNumber = await GenerateNoteNumberAsync(cancellationToken);

        var note = new Novologs.Domain.Entities.DebitNote(0)
        {
            NoteNumber                  = noteNumber,
            VendorId                    = request.VendorId,
            Currency                    = request.Currency,
            InvoiceType                 = request.InvoiceType,
            BillingAddress              = request.BillingAddress,
            Location                    = request.Location,
            Terms                       = request.Terms,
            NoteDate                    = DateTime.SpecifyKind(request.NoteDate, DateTimeKind.Utc),
            DueDate                     = request.DueDate.HasValue ? DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc) : null,
            OurRef                      = request.OurRef,
            YourRef                     = request.YourRef,
            MessageOnNote               = request.MessageOnNote,
            DebitAccountId              = debitAccountId,
            CreditAccountId             = creditAccountId,
            PurchaseInvoiceId           = request.PurchaseInvoiceId,
            OverallDiscountType         = request.OverallDiscountType,
            OverallDiscountValue        = request.OverallDiscountValue,
            Subtotal                    = calc.Subtotal,
            TotalLineDiscount           = calc.TotalLineDiscount,
            SubtotalAfterLineDiscounts  = calc.SubtotalAfterLineDiscounts,
            OverallDiscountAmount       = calc.OverallDiscountAmount,
            TotalTaxableAmount          = calc.TotalTaxableAmount,
            TotalTax                    = calc.TotalTax,
            GrandTotal                  = calc.GrandTotal,
            Items = items.Select((item, idx) =>
            {
                var r = calc.Items[idx];
                return new Novologs.Domain.Entities.DebitNoteItem
                {
                    ProductId                = item.ProductId,
                    Unit                     = item.Unit?.Value,
                    Quantity                 = item.Quantity,
                    UnitPrice                = item.UnitPrice,
                    LineDiscountType         = item.LineDiscountType,
                    LineDiscountValue        = item.LineDiscountValue,
                    TaxPercent               = item.TaxPercent,
                    LineBase                 = r.LineBase,
                    LineDiscountAmount       = r.LineDiscountAmount,
                    TaxableAmount            = r.TaxableAmount,
                    AllocatedOverallDiscount = r.AllocatedOverallDiscount,
                    FinalTaxableAmount       = r.FinalTaxableAmount,
                    TaxAmount                = r.TaxAmount,
                    LineTotal                = r.LineTotal
                };
            }).ToList()
        };

        var id = await _repository.AddAsync(note, cancellationToken);

        return Result<CreateDebitNoteResponse>.Success(new CreateDebitNoteResponse(id, noteNumber));
    }

    private async Task<string> GenerateNoteNumberAsync(CancellationToken cancellationToken)
    {
        const string prefix = "DN-";

        var existing = await _context.GetSet<Novologs.Domain.Entities.DebitNote>()
            .Where(n => EF.Functions.Like(n.NoteNumber, prefix + "%"))
            .Select(n => n.NoteNumber)
            .ToListAsync(cancellationToken);

        var maxSeq = 0;
        var rx     = new Regex(@"^DN-(\d+)$");
        foreach (var num in existing)
        {
            var m = rx.Match(num);
            if (m.Success && int.TryParse(m.Groups[1].Value, out var v))
                maxSeq = Math.Max(maxSeq, v);
        }

        return $"{prefix}{(maxSeq + 1).ToString().PadLeft(4, '0')}";
    }
}
