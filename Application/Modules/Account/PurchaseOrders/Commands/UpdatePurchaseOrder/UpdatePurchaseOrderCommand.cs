using Novologs.Application.Modules.Account.PurchaseOrders.DTOs;
using Novologs.Application.Modules.Account.PurchaseOrders.Interfaces;
using Novologs.Application.Modules.Account.PurchaseOrders.Services;
using Novologs.Application.Modules.Account.Transactions.Commands.CreateTransaction;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.PurchaseOrders.Commands.UpdatePurchaseOrder;

public class UpdatePurchaseOrderItemRequest
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

[AuthorizePermission(Permissions.Accounting.UpdatePurchaseOrder)]
public record UpdatePurchaseOrderCommand : IRequest<Result<PurchaseOrderDto>>
{
    public int Id { get; init; }
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
    public List<UpdatePurchaseOrderItemRequest> Items { get; init; } = new();
    public List<AttachmentRequest>? NewAttachments { get; init; }
    public List<int>? AttachmentIdsToDelete { get; init; }
}

public class UpdatePurchaseOrderCommandHandler : IRequestHandler<UpdatePurchaseOrderCommand, Result<PurchaseOrderDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IPurchaseOrderRepository _repository;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public UpdatePurchaseOrderCommandHandler(
        ITenantDbContext context,
        IPurchaseOrderRepository repository,
        IMapper mapper,
        IUser user)
    {
        _context    = context;
        _repository = repository;
        _mapper     = mapper;
        _user       = user;
    }

    public async Task<Result<PurchaseOrderDto>> Handle(UpdatePurchaseOrderCommand request, CancellationToken cancellationToken)
    {
        var po = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (po is null)
            return Result<PurchaseOrderDto>.Failure("PO_404_NOT_FOUND", $"Purchase order with ID {request.Id} was not found.");

        if (po.Status != PurchaseOrderStatus.Draft)
            return Result<PurchaseOrderDto>.Failure("PO_409_NOT_DRAFT", "Only Draft purchase orders can be updated.");

        // Validate products
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products   = await _context.GetSet<Novologs.Domain.Entities.Product>()
            .Include(p => p.Name)
            .Where(p => productIds.Contains(p.Id) && !p.IsDeleted)
            .ToListAsync(cancellationToken);

        var missingProductId = productIds.FirstOrDefault(id => products.All(p => p.Id != id));
        if (missingProductId != default)
            return Result<PurchaseOrderDto>.Failure("PO_404_PRODUCT_NOT_FOUND",
                $"Product with ID {missingProductId} was not found.");

        var inactiveProduct = products.FirstOrDefault(p => !p.IsActive);
        if (inactiveProduct != null)
            return Result<PurchaseOrderDto>.Failure("PO_400_PRODUCT_INACTIVE",
                $"Product '{inactiveProduct.Name.Value}' is inactive and cannot be used in a purchase order.");

        // Recalculate
        var itemInputs = request.Items.Select(i => new PurchaseOrderCalculator.ItemInput(
            i.Quantity,
            i.UnitPrice,
            i.LineDiscountType,
            i.LineDiscountType == DiscountType.Percentage ? i.LineDiscountPercent : i.LineDiscountValue,
            i.TaxPercent)).ToList();

        var calc = PurchaseOrderCalculator.Calculate(itemInputs, request.OverallDiscountType, request.OverallDiscountValue);

        // Validate line discounts
        for (var idx = 0; idx < calc.Items.Count; idx++)
        {
            var r = calc.Items[idx];
            if (r.LineDiscountAmount > r.LineBase)
                return Result<PurchaseOrderDto>.Failure("PO_400_LINE_DISCOUNT_EXCEEDS",
                    $"Line {idx + 1}: discount amount ({r.LineDiscountAmount}) exceeds line base ({r.LineBase}).");
        }

        // Validate overall discount
        if (calc.OverallDiscountAmount > calc.SubtotalAfterLineDiscounts)
            return Result<PurchaseOrderDto>.Failure("PO_400_OVERALL_DISCOUNT_EXCEEDS",
                $"Overall discount ({calc.OverallDiscountAmount}) exceeds subtotal after line discounts ({calc.SubtotalAfterLineDiscounts}).");

        // Update header
        po.VendorId                   = request.VendorId;
        po.Currency                   = request.Currency;
        po.BillingAddress             = request.BillingAddress;
        po.OrderType                  = request.OrderType;
        po.Location                   = request.Location;
        po.Terms                      = request.Terms;
        po.PurchaseDate               = DateTime.SpecifyKind(request.PurchaseDate, DateTimeKind.Utc);
        po.DueDate                    = request.DueDate.HasValue ? DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc) : null;
        po.OurRef                     = request.OurRef;
        po.YourRef                    = request.YourRef;
        po.MessageOnPurchase          = request.MessageOnPurchase;
        po.OverallDiscountType        = request.OverallDiscountType;
        po.OverallDiscountValue       = request.OverallDiscountValue;
        po.Subtotal                   = calc.Subtotal;
        po.TotalLineDiscount          = calc.TotalLineDiscount;
        po.SubtotalAfterLineDiscounts = calc.SubtotalAfterLineDiscounts;
        po.OverallDiscountAmount      = calc.OverallDiscountAmount;
        po.TotalTaxableAmount         = calc.TotalTaxableAmount;
        po.TotalTax                   = calc.TotalTax;
        po.GrandTotal                 = calc.GrandTotal;

        // Replace items
        po.Items.Clear();
        for (var idx = 0; idx < request.Items.Count; idx++)
        {
            var item = request.Items[idx];
            var r    = calc.Items[idx];
            po.Items.Add(new Novologs.Domain.Entities.PurchaseOrderItem
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
            });
        }

        // Remove attachments flagged for deletion
        if (request.AttachmentIdsToDelete?.Count > 0)
        {
            var toRemove = po.Attachments
                .Where(a => request.AttachmentIdsToDelete.Contains(a.Id))
                .ToList();
            foreach (var a in toRemove)
                po.Attachments.Remove(a);
        }

        // Add new attachments
        if (request.NewAttachments?.Count > 0)
        {
            foreach (var a in request.NewAttachments)
            {
                po.Attachments.Add(new Novologs.Domain.Entities.PurchaseOrderAttachment
                {
                    PurchaseOrderId = po.Id,
                    FileName        = a.FileName,
                    FileUrl         = a.FileUrl,
                    FilePath        = a.FilePath,
                    MimeType        = a.MimeType,
                    FileSize        = a.FileSize,
                    UploadedAt      = DateTime.UtcNow,
                    UploadedBy      = _user.Id ?? "system"
                });
            }
        }

        await _repository.UpdateAsync(po, cancellationToken);

        // Reload to populate Product navigation properties on new items before mapping.
        // The new PurchaseOrderItem instances added above have Product = null,
        // which would cause a NullReferenceException in the AutoMapper configuration.
        var refreshed = await _repository.GetByIdAsync(request.Id, cancellationToken);
        var dto = _mapper.Map<PurchaseOrderDto>(refreshed!);

        // Resolve unit names from ProductUnit entities
        var rawItemUnitMap = refreshed!.Items
            .Where(i => i.Unit != null && Guid.TryParse(i.Unit, out _))
            .ToDictionary(i => i.Id, i => Guid.Parse(i.Unit!));

        if (rawItemUnitMap.Count > 0)
        {
            var unitIds = rawItemUnitMap.Values.Distinct().ToList();
            var units = await _context.GetSet<Novologs.Domain.Entities.ProductUnit>()
                .Include(u => u.Name)
                .Where(u => unitIds.Contains(u.Id))
                .AsNoTracking()
                .ToDictionaryAsync(u => u.Id, cancellationToken);

            foreach (var dtoItem in dto.Items)
            {
                if (rawItemUnitMap.TryGetValue(dtoItem.Id, out var unitId) && units.TryGetValue(unitId, out var unit))
                    dtoItem.Unit = new UnitSummaryDto { Id = unitId, Value = unit.Name.Value };
            }
        }

        return Result<PurchaseOrderDto>.Success(dto);
    }
}
