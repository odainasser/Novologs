using Novologs.Application.Modules.Account.SalesInvoices.Commands.CreateSalesInvoice;
using Novologs.Application.Modules.Account.SalesInvoices.DTOs;
using Novologs.Application.Modules.Account.SalesInvoices.Interfaces;
using Novologs.Application.Modules.Account.PurchaseOrders.Services;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.SalesInvoices.Commands.UpdateSalesInvoice;

public class UpdateSalesInvoiceItemRequest
{
    public int ProductId { get; init; }
    public UnitRequest? Unit { get; init; }
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public DiscountType LineDiscountType { get; init; } = DiscountType.Percentage;
    public decimal LineDiscountValue { get; init; } = 0;
    public decimal TaxPercent { get; init; } = 0;
}

[AuthorizePermission(Permissions.Accounting.UpdateSalesInvoice)]
public record UpdateSalesInvoiceCommand : IRequest<Result<SalesInvoiceDto>>
{
    public int Id { get; init; }
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
    public List<UpdateSalesInvoiceItemRequest> Items { get; init; } = new();
}

public class UpdateSalesInvoiceCommandHandler : IRequestHandler<UpdateSalesInvoiceCommand, Result<SalesInvoiceDto>>
{
    private readonly ITenantDbContext _context;
    private readonly ISalesInvoiceRepository _repository;
    private readonly IMapper _mapper;

    public UpdateSalesInvoiceCommandHandler(
        ITenantDbContext context,
        ISalesInvoiceRepository repository,
        IMapper mapper)
    {
        _context    = context;
        _repository = repository;
        _mapper     = mapper;
    }

    public async Task<Result<SalesInvoiceDto>> Handle(UpdateSalesInvoiceCommand request, CancellationToken cancellationToken)
    {
        var invoice = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (invoice is null)
            return Result<SalesInvoiceDto>.Failure("SINV_404_NOT_FOUND", $"Sales invoice with ID {request.Id} was not found.");

        if (invoice.Status != Novologs.Domain.Enums.SalesInvoiceStatus.Draft)
            return Result<SalesInvoiceDto>.Failure("SINV_409_NOT_DRAFT", "Only Draft sales invoices can be updated.");

        // Validate products
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products   = await _context.GetSet<Novologs.Domain.Entities.Product>()
            .Include(p => p.Name)
            .Where(p => productIds.Contains(p.Id) && !p.IsDeleted)
            .ToListAsync(cancellationToken);

        var missingProductId = productIds.FirstOrDefault(id => products.All(p => p.Id != id));
        if (missingProductId != default)
            return Result<SalesInvoiceDto>.Failure("SINV_404_PRODUCT_NOT_FOUND",
                $"Product with ID {missingProductId} was not found.");

        var inactiveProduct = products.FirstOrDefault(p => !p.IsActive);
        if (inactiveProduct != null)
            return Result<SalesInvoiceDto>.Failure("SINV_400_PRODUCT_INACTIVE",
                $"Product '{inactiveProduct.Name.Value}' is inactive and cannot be used in a sales invoice.");

        // Recalculate
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
                return Result<SalesInvoiceDto>.Failure("SINV_400_LINE_DISCOUNT_EXCEEDS",
                    $"Line {idx + 1}: discount amount ({r.LineDiscountAmount}) exceeds line base ({r.LineBase}).");
        }

        // Validate overall discount
        if (calc.OverallDiscountAmount > calc.SubtotalAfterLineDiscounts)
            return Result<SalesInvoiceDto>.Failure("SINV_400_OVERALL_DISCOUNT_EXCEEDS",
                $"Overall discount ({calc.OverallDiscountAmount}) exceeds subtotal after line discounts ({calc.SubtotalAfterLineDiscounts}).");

        // Update header
        invoice.ClientId                   = request.ClientId;
        invoice.Currency                   = request.Currency;
        invoice.InvoiceType                = request.InvoiceType;
        invoice.BillingAddress             = request.BillingAddress;
        invoice.Location                   = request.Location;
        invoice.Terms                      = request.Terms;
        invoice.InvoiceDate                = DateTime.SpecifyKind(request.InvoiceDate, DateTimeKind.Utc);
        invoice.DueDate                    = request.DueDate.HasValue ? DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc) : null;
        invoice.OurRef                     = request.OurRef;
        invoice.YourRef                    = request.YourRef;
        invoice.MessageOnInvoice           = request.MessageOnInvoice;
        invoice.DebitAccountId             = request.DebitAccountId;
        invoice.CreditAccountId            = request.CreditAccountId;
        invoice.OverallDiscountType        = request.OverallDiscountType;
        invoice.OverallDiscountValue       = request.OverallDiscountValue;
        invoice.Subtotal                   = calc.Subtotal;
        invoice.TotalLineDiscount          = calc.TotalLineDiscount;
        invoice.SubtotalAfterLineDiscounts = calc.SubtotalAfterLineDiscounts;
        invoice.OverallDiscountAmount      = calc.OverallDiscountAmount;
        invoice.TotalTaxableAmount         = calc.TotalTaxableAmount;
        invoice.TotalTax                   = calc.TotalTax;
        invoice.GrandTotal                 = calc.GrandTotal;

        // Replace items
        invoice.Items.Clear();
        foreach (var (item, idx) in request.Items.Select((item, idx) => (item, idx)))
        {
            var r = calc.Items[idx];
            invoice.Items.Add(new Novologs.Domain.Entities.SalesInvoiceItem
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
            });
        }

        await _repository.UpdateAsync(invoice, cancellationToken);

        return Result<SalesInvoiceDto>.Success(_mapper.Map<SalesInvoiceDto>(invoice));
    }
}
