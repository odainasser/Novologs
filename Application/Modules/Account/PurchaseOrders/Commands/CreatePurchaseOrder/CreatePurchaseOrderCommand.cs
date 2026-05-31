using Novologs.Application.Modules.Account.PurchaseOrders.DTOs;
using Novologs.Application.Modules.Account.PurchaseOrders.Interfaces;
using Novologs.Application.Modules.Account.PurchaseOrders.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.PurchaseOrders.Commands.CreatePurchaseOrder;

public class CreatePurchaseOrderItemRequest
{
    public int ProductId { get; init; }
    public UnitRequest? Unit { get; init; }
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public DiscountType LineDiscountType { get; init; } = DiscountType.Percentage;
    public decimal LineDiscountValue { get; init; } = 0;
    public decimal LineDiscountPercent { get; init; } = 0;
    public decimal TaxPercent { get; init; } = 0;
}

public record CreatePurchaseOrderResponse(int Id, string PoNumber);


[AuthorizePermission(Permissions.Accounting.AddPurchaseOrder)]
public record CreatePurchaseOrderCommand : IRequest<Result<CreatePurchaseOrderResponse>>
{
    public Guid VendorId { get; init; }
    public string Currency { get; init; } = default!;
    public string? BillingAddress { get; init; }
    public string? OrderType { get; init; }
    public string? Location { get; init; }
    public string? Terms { get; init; }
    public DateTime PurchaseDate { get; init; }
    public DateTime? DueDate { get; init; }
    public string? OurRef { get; init; }
    public string? YourRef { get; init; }
    public DiscountType OverallDiscountType { get; init; } = DiscountType.Percentage;
    public decimal OverallDiscountValue { get; init; } = 0;
    public string? MessageOnPurchase { get; init; }
    public List<CreatePurchaseOrderItemRequest> Items { get; init; } = new();
}

public class CreatePurchaseOrderCommandHandler : IRequestHandler<CreatePurchaseOrderCommand, Result<CreatePurchaseOrderResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IPurchaseOrderRepository _repository;
    private readonly IPoNumberService _poNumberService;
    private readonly IUser _user;

    public CreatePurchaseOrderCommandHandler(
        ITenantDbContext context,
        IPurchaseOrderRepository repository,
        IPoNumberService poNumberService,
        IUser user)
    {
        _context         = context;
        _repository      = repository;
        _poNumberService = poNumberService;
        _user            = user;
    }

    public async Task<Result<CreatePurchaseOrderResponse>> Handle(CreatePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        // Validate all products exist and are active
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products   = await _context.GetSet<Novologs.Domain.Entities.Product>()
            .Include(p => p.Name)
            .Where(p => productIds.Contains(p.Id) && !p.IsDeleted)
            .ToListAsync(cancellationToken);

        var missingProductId = productIds.FirstOrDefault(id => products.All(p => p.Id != id));
        if (missingProductId != default)
            return Result<CreatePurchaseOrderResponse>.Failure("PO_404_PRODUCT_NOT_FOUND",
                $"Product with ID {missingProductId} was not found.");

        var inactiveProduct = products.FirstOrDefault(p => !p.IsActive);
        if (inactiveProduct != null)
            return Result<CreatePurchaseOrderResponse>.Failure("PO_400_PRODUCT_INACTIVE",
                $"Product '{inactiveProduct.Name.Value}' is inactive and cannot be used in a purchase order.");

        // Run calculations
        var itemInputs = request.Items.Select(i => new PurchaseOrderCalculator.ItemInput(
            i.Quantity,
            i.UnitPrice,
            i.LineDiscountType,
            i.LineDiscountType == DiscountType.Percentage ? i.LineDiscountPercent : i.LineDiscountValue,
            i.TaxPercent)).ToList();

        var calc = PurchaseOrderCalculator.Calculate(itemInputs, request.OverallDiscountType, request.OverallDiscountValue);

        // Validate line discounts do not exceed line base
        for (var idx = 0; idx < calc.Items.Count; idx++)
        {
            var r = calc.Items[idx];
            if (r.LineDiscountAmount > r.LineBase)
                return Result<CreatePurchaseOrderResponse>.Failure("PO_400_LINE_DISCOUNT_EXCEEDS",
                    $"Line {idx + 1}: discount amount ({r.LineDiscountAmount}) exceeds line base ({r.LineBase}).");
        }

        // Validate overall discount does not exceed subtotal after line discounts
        if (calc.OverallDiscountAmount > calc.SubtotalAfterLineDiscounts)
            return Result<CreatePurchaseOrderResponse>.Failure("PO_400_OVERALL_DISCOUNT_EXCEEDS",
                $"Overall discount ({calc.OverallDiscountAmount}) exceeds subtotal after line discounts ({calc.SubtotalAfterLineDiscounts}).");

// Generate PO number via PostgreSQL sequence â€” atomic and race-condition-free.
        // Retry loop is a belt-and-suspenders guard for unexpected DB errors only.
        const int maxPoAttempts = 3;
        for (var attempt = 0; attempt < maxPoAttempts; attempt++)
        {
            var poNumber = await _poNumberService.GeneratePoNumberAsync(cancellationToken);

            // Build a fresh entity each attempt to avoid EF change-tracker conflicts
            var purchaseOrder = new Novologs.Domain.Entities.PurchaseOrder(0)
            {
                PoNumber                    = poNumber,
                VendorId                    = request.VendorId,
                Currency                    = request.Currency,
                BillingAddress              = request.BillingAddress,
                OrderType                   = request.OrderType,
                Location                    = request.Location,
                Terms                       = request.Terms,
                PurchaseDate                = DateTime.SpecifyKind(request.PurchaseDate, DateTimeKind.Utc),
                DueDate                     = request.DueDate.HasValue ? DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc) : null,
                OurRef                      = request.OurRef,
                YourRef                     = request.YourRef,
                MessageOnPurchase           = request.MessageOnPurchase,
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
                    return new Novologs.Domain.Entities.PurchaseOrderItem
                    {
                        ProductId                = item.ProductId,
                        Unit                     = item.Unit?.Value,
                        Quantity                 = item.Quantity,
                        UnitPrice                = item.UnitPrice,
                        LineDiscountType         = item.LineDiscountType,
                        LineDiscountValue        = item.LineDiscountValue,
                        LineDiscountPercent      = item.LineDiscountPercent,
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

            try
            {
                var id = await _repository.AddAsync(purchaseOrder, cancellationToken);
                return Result<CreatePurchaseOrderResponse>.Success(new CreatePurchaseOrderResponse(id, poNumber));
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
                when (attempt < maxPoAttempts - 1 && IsPoNumberDuplicate(ex))
            {
                // A concurrent request claimed this PO number; regenerate and retry.
            }
        }

        throw new InvalidOperationException("Failed to generate a unique PO number after multiple attempts.");
    }

    private static bool IsPoNumberDuplicate(Microsoft.EntityFrameworkCore.DbUpdateException ex)
    {
        Exception? inner = ex.InnerException;
        while (inner is not null)
        {
            if (inner.Message.Contains("IX_PurchaseOrders_PoNumber", StringComparison.Ordinal))
                return true;
            inner = inner.InnerException;
        }
        return false;
    }
}
