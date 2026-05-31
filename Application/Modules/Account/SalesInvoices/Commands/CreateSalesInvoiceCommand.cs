using System.Text.RegularExpressions;
using Novologs.Application.Modules.Account.SalesInvoices.DTOs;
using Novologs.Application.Modules.Account.SalesInvoices.Interfaces;
using Novologs.Application.Modules.Account.PurchaseOrders.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.SalesInvoices.Commands.CreateSalesInvoice;

public class UnitRequest
{
    public string? Value { get; init; }
}

public class CreateSalesInvoiceItemRequest
{
    public int ProductId { get; init; }
    public UnitRequest? Unit { get; init; }
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public DiscountType LineDiscountType { get; init; } = DiscountType.Percentage;
    public decimal LineDiscountValue { get; init; } = 0;
    public decimal TaxPercent { get; init; } = 0;
}

public record CreateSalesInvoiceResponse(int Id, string InvNumber);

[AuthorizePermission(Permissions.Accounting.AddSalesInvoice)]
public record CreateSalesInvoiceCommand : IRequest<Result<CreateSalesInvoiceResponse>>
{
    public Guid ClientId { get; init; }
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
    public Guid CreditAccountId { get; init; }
    public DiscountType OverallDiscountType { get; init; } = DiscountType.Percentage;
    public decimal OverallDiscountValue { get; init; } = 0;
    public List<CreateSalesInvoiceItemRequest> Items { get; init; } = new();
}

public class CreateSalesInvoiceCommandHandler : IRequestHandler<CreateSalesInvoiceCommand, Result<CreateSalesInvoiceResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly ISalesInvoiceRepository _repository;
    private readonly IUser _user;

    public CreateSalesInvoiceCommandHandler(
        ITenantDbContext context,
        ISalesInvoiceRepository repository,
        IUser user)
    {
        _context    = context;
        _repository = repository;
        _user       = user;
    }

    public async Task<Result<CreateSalesInvoiceResponse>> Handle(CreateSalesInvoiceCommand request, CancellationToken cancellationToken)
    {
        // Validate all products exist and are active
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products   = await _context.GetSet<Novologs.Domain.Entities.Product>()
            .Include(p => p.Name)
            .Where(p => productIds.Contains(p.Id) && !p.IsDeleted)
            .ToListAsync(cancellationToken);

        var missingProductId = productIds.FirstOrDefault(id => products.All(p => p.Id != id));
        if (missingProductId != default)
            return Result<CreateSalesInvoiceResponse>.Failure("SINV_404_PRODUCT_NOT_FOUND",
                $"Product with ID {missingProductId} was not found.");

        var inactiveProduct = products.FirstOrDefault(p => !p.IsActive);
        if (inactiveProduct != null)
            return Result<CreateSalesInvoiceResponse>.Failure("SINV_400_PRODUCT_INACTIVE",
                $"Product '{inactiveProduct.Name.Value}' is inactive and cannot be used in a sales invoice.");

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
                return Result<CreateSalesInvoiceResponse>.Failure("SINV_400_LINE_DISCOUNT_EXCEEDS",
                    $"Line {idx + 1}: discount amount ({r.LineDiscountAmount}) exceeds line base ({r.LineBase}).");
        }

        // Validate overall discount
        if (calc.OverallDiscountAmount > calc.SubtotalAfterLineDiscounts)
            return Result<CreateSalesInvoiceResponse>.Failure("SINV_400_OVERALL_DISCOUNT_EXCEEDS",
                $"Overall discount ({calc.OverallDiscountAmount}) exceeds subtotal after line discounts ({calc.SubtotalAfterLineDiscounts}).");

        // Generate invoice number
        var invNumber = await GenerateInvNumberAsync(cancellationToken);

        var invoice = new Novologs.Domain.Entities.SalesInvoice(0)
        {
            InvNumber                   = invNumber,
            ClientId                    = request.ClientId,
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
            CreditAccountId             = request.CreditAccountId,
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
                return new Novologs.Domain.Entities.SalesInvoiceItem
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

        return Result<CreateSalesInvoiceResponse>.Success(new CreateSalesInvoiceResponse(id, invNumber));
    }

    private async Task<string> GenerateInvNumberAsync(CancellationToken cancellationToken)
    {
        const string prefix = "SINV-";

        var existing = await _context.GetSet<Novologs.Domain.Entities.SalesInvoice>()
            .Where(inv => EF.Functions.Like(inv.InvNumber, prefix + "%"))
            .Select(inv => inv.InvNumber)
            .ToListAsync(cancellationToken);

        var maxSeq = 0;
        var rx     = new Regex(@"^SINV-(\d+)$");
        foreach (var num in existing)
        {
            var m = rx.Match(num);
            if (m.Success && int.TryParse(m.Groups[1].Value, out var v))
                maxSeq = Math.Max(maxSeq, v);
        }

        return $"{prefix}{(maxSeq + 1).ToString().PadLeft(4, '0')}";
    }
}
