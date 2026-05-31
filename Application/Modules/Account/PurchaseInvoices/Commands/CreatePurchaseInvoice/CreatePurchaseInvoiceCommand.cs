using System.Text.RegularExpressions;
using Novologs.Application.Modules.Account.PurchaseInvoices.DTOs;
using Novologs.Application.Modules.Account.PurchaseInvoices.Interfaces;
using Novologs.Application.Modules.Account.PurchaseOrders.DTOs;
using Novologs.Application.Modules.Account.PurchaseOrders.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.PurchaseInvoices.Commands.CreatePurchaseInvoice;

public class CreatePurchaseInvoiceItemRequest
{
    public int ProductId { get; init; }
    public UnitRequest? Unit { get; init; }
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public DiscountType LineDiscountType { get; init; }
    public decimal LineDiscountValue { get; init; } = 0;
    public decimal TaxPercent { get; init; } = 0;
}

public record CreatePurchaseInvoiceResponse(int Id, string InvNumber);


[AuthorizePermission(Permissions.Accounting.AddPurchaseInvoice)]
public record CreatePurchaseInvoiceCommand : IRequest<Result<CreatePurchaseInvoiceResponse>>
{
    public Guid VendorId { get; init; }
    public string Currency { get; init; } = default!;
    public InvoiceType InvoiceType { get; init; } = InvoiceType.TaxCashInvoice;
    public string? BillingAddress { get; init; }
    public string? Location { get; init; }
    public string? Terms { get; init; }
    public DateTime InvoiceDate { get; init; }
    public DateTime? DueDate { get; init; }
    public string? OurRef { get; init; }
    public string? YourRef { get; init; }
    public string? MessageOnInvoice { get; init; }
    public Guid DebitAccountId { get; init; }
    public int? PurchaseOrderId { get; init; }
    public DiscountType OverallDiscountType { get; init; } = DiscountType.Percentage;
    public decimal OverallDiscountValue { get; init; } = 0;
    public List<CreatePurchaseInvoiceItemRequest> Items { get; init; } = new();
}

public class CreatePurchaseInvoiceCommandHandler : IRequestHandler<CreatePurchaseInvoiceCommand, Result<CreatePurchaseInvoiceResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IPurchaseInvoiceRepository _repository;
    private readonly IUser _user;

    public CreatePurchaseInvoiceCommandHandler(
        ITenantDbContext context,
        IPurchaseInvoiceRepository repository,
        IUser user)
    {
        _context    = context;
        _repository = repository;
        _user       = user;
    }

    public async Task<Result<CreatePurchaseInvoiceResponse>> Handle(CreatePurchaseInvoiceCommand request, CancellationToken cancellationToken)
    {
        // Fetch CreditAccountId from VendorAccount
        var vendorAccount = await _context.GetSet<Novologs.Domain.Entities.VendorAccount>()
            .FirstOrDefaultAsync(va => va.VendorId == request.VendorId, cancellationToken);

        if (vendorAccount is null)
            return Result<CreatePurchaseInvoiceResponse>.Failure("INV_404_VENDOR_ACCOUNT_NOT_FOUND",
                $"No GL account is linked to vendor {request.VendorId}. Please set up a vendor account first.");

        // Validate debit account exists and is not deleted
        var debitAccountExists = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .AnyAsync(a => a.Id == request.DebitAccountId && !a.IsDeleted, cancellationToken);

        if (!debitAccountExists)
            return Result<CreatePurchaseInvoiceResponse>.Failure("INV_404_DEBIT_ACCOUNT_NOT_FOUND",
                $"Debit account with ID {request.DebitAccountId} was not found.");

        // Validate linked PO exists and is Confirmed
        if (request.PurchaseOrderId.HasValue)
        {
            var po = await _context.GetSet<Novologs.Domain.Entities.PurchaseOrder>()
                .FirstOrDefaultAsync(p => p.Id == request.PurchaseOrderId.Value && !p.IsDeleted, cancellationToken);

            if (po is null)
                return Result<CreatePurchaseInvoiceResponse>.Failure("INV_404_PO_NOT_FOUND",
                    $"Purchase order with ID {request.PurchaseOrderId.Value} was not found.");

            if (po.Status != Novologs.Domain.Enums.PurchaseOrderStatus.Confirmed)
                return Result<CreatePurchaseInvoiceResponse>.Failure("INV_400_PO_NOT_CONFIRMED",
                    "Only Confirmed purchase orders can be linked to an invoice.");
        }

        // Validate all products exist and are active
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products   = await _context.GetSet<Novologs.Domain.Entities.Product>()
            .Include(p => p.Name)
            .Where(p => productIds.Contains(p.Id) && !p.IsDeleted)
            .ToListAsync(cancellationToken);

        var missingProductId = productIds.FirstOrDefault(id => products.All(p => p.Id != id));
        if (missingProductId != default)
            return Result<CreatePurchaseInvoiceResponse>.Failure("INV_404_PRODUCT_NOT_FOUND",
                $"Product with ID {missingProductId} was not found.");

        var inactiveProduct = products.FirstOrDefault(p => !p.IsActive);
        if (inactiveProduct != null)
            return Result<CreatePurchaseInvoiceResponse>.Failure("INV_400_PRODUCT_INACTIVE",
                $"Product '{inactiveProduct.Name.Value}' is inactive and cannot be used in an invoice.");

        // Run calculations
        var itemInputs = request.Items.Select(i => new PurchaseOrderCalculator.ItemInput(
            i.Quantity,
            i.UnitPrice,
            i.LineDiscountType,
            i.LineDiscountValue,
            i.TaxPercent)).ToList();

        var calc = PurchaseOrderCalculator.Calculate(itemInputs, request.OverallDiscountType, request.OverallDiscountValue);

        // Validate line discounts
        for (var idx = 0; idx < calc.Items.Count; idx++)
        {
            var r = calc.Items[idx];
            if (r.LineDiscountAmount > r.LineBase)
                return Result<CreatePurchaseInvoiceResponse>.Failure("INV_400_LINE_DISCOUNT_EXCEEDS",
                    $"Line {idx + 1}: discount amount ({r.LineDiscountAmount}) exceeds line base ({r.LineBase}).");
        }

        // Validate overall discount
        if (calc.OverallDiscountAmount > calc.SubtotalAfterLineDiscounts)
            return Result<CreatePurchaseInvoiceResponse>.Failure("INV_400_OVERALL_DISCOUNT_EXCEEDS",
                $"Overall discount ({calc.OverallDiscountAmount}) exceeds subtotal after line discounts ({calc.SubtotalAfterLineDiscounts}).");

        // Generate invoice number
        var invNumber = await GenerateInvNumberAsync(cancellationToken);

        var invoice = new Novologs.Domain.Entities.PurchaseInvoice(0)
        {
            InvNumber                   = invNumber,
            VendorId                    = request.VendorId,
            Currency                    = request.Currency,
            InvoiceType                 = request.InvoiceType,
            BillingAddress              = request.BillingAddress,
            Location                    = request.Location,
            Terms                       = request.Terms,
            InvoiceDate                 = DateTime.SpecifyKind(request.InvoiceDate, DateTimeKind.Utc),
            DueDate                     = request.DueDate.HasValue ? DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc) : null,
            OurRef                      = request.OurRef,
            YourRef                     = request.YourRef,
            MessageOnInvoice            = request.MessageOnInvoice,
            DebitAccountId              = request.DebitAccountId,
            CreditAccountId             = vendorAccount.AccountId,
            PurchaseOrderId             = request.PurchaseOrderId,
            OverallDiscountType         = request.OverallDiscountType,
            OverallDiscountValue        = request.OverallDiscountValue,
            Subtotal                    = calc.Subtotal,
            TotalLineDiscount           = calc.TotalLineDiscount,
            SubtotalAfterLineDiscounts  = calc.SubtotalAfterLineDiscounts,
            OverallDiscountAmount       = calc.OverallDiscountAmount,
            TotalTaxableAmount          = calc.TotalTaxableAmount,
            TotalTax                    = calc.TotalTax,
            GrandTotal                  = calc.GrandTotal,
            Items = request.Items.Select((item, idx) =>
            {
                var r = calc.Items[idx];
                return new Novologs.Domain.Entities.PurchaseInvoiceItem
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

        var id = await _repository.AddAsync(invoice, cancellationToken);

        return Result<CreatePurchaseInvoiceResponse>.Success(new CreatePurchaseInvoiceResponse(id, invNumber));
    }

    private async Task<string> GenerateInvNumberAsync(CancellationToken cancellationToken)
    {
        const string prefix = "INV-";

        var existing = await _context.GetSet<Novologs.Domain.Entities.PurchaseInvoice>()
            .Where(inv => EF.Functions.Like(inv.InvNumber, prefix + "%"))
            .Select(inv => inv.InvNumber)
            .ToListAsync(cancellationToken);

        var maxSeq = 0;
        var rx     = new Regex(@"^INV-(\d+)$");
        foreach (var num in existing)
        {
            var m = rx.Match(num);
            if (m.Success && int.TryParse(m.Groups[1].Value, out var v))
                maxSeq = Math.Max(maxSeq, v);
        }

        return $"{prefix}{(maxSeq + 1).ToString().PadLeft(4, '0')}";
    }
}
