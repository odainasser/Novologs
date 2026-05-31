using Novologs.Application.Modules.Account.DebitNotes.DTOs;
using Novologs.Application.Modules.Account.DebitNotes.Interfaces;
using Novologs.Application.Modules.Account.PurchaseOrders.DTOs;
using Novologs.Application.Modules.Account.PurchaseOrders.Services;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.DebitNotes.Commands.UpdateDebitNote;

public class UpdateDebitNoteItemRequest
{
    public int ProductId { get; init; }
    public UnitRequest? Unit { get; init; }
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public DiscountType LineDiscountType { get; init; }
    public decimal LineDiscountValue { get; init; } = 0;
    public decimal TaxPercent { get; init; } = 0;
}

[AuthorizePermission(Permissions.Accounting.UpdateDebitNote)]
public record UpdateDebitNoteCommand : IRequest<Result<DebitNoteDto>>
{
    public int Id { get; init; }
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
    public Guid DebitAccountId { get; init; }
    public Guid CreditAccountId { get; init; }
    public int? PurchaseInvoiceId { get; init; }
    public DiscountType OverallDiscountType { get; init; } = DiscountType.Percentage;
    public decimal OverallDiscountValue { get; init; } = 0;
    public List<UpdateDebitNoteItemRequest> Items { get; init; } = new();
}

public class UpdateDebitNoteCommandHandler : IRequestHandler<UpdateDebitNoteCommand, Result<DebitNoteDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IDebitNoteRepository _repository;
    private readonly IMapper _mapper;

    public UpdateDebitNoteCommandHandler(
        ITenantDbContext context,
        IDebitNoteRepository repository,
        IMapper mapper)
    {
        _context    = context;
        _repository = repository;
        _mapper     = mapper;
    }

    public async Task<Result<DebitNoteDto>> Handle(UpdateDebitNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (note is null)
            return Result<DebitNoteDto>.Failure("DN_404_NOT_FOUND", $"Debit note with ID {request.Id} was not found.");

        if (note.Status != Novologs.Domain.Enums.DebitNoteStatus.Draft)
            return Result<DebitNoteDto>.Failure("DN_409_NOT_DRAFT", "Only Draft debit notes can be updated.");

        if (request.DebitAccountId == request.CreditAccountId)
            return Result<DebitNoteDto>.Failure("DN_400_SAME_ACCOUNTS", "Debit and credit accounts must be different.");

        // Validate products
        var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
        var products   = await _context.GetSet<Novologs.Domain.Entities.Product>()
            .Include(p => p.Name)
            .Where(p => productIds.Contains(p.Id) && !p.IsDeleted)
            .ToListAsync(cancellationToken);

        var missingProductId = productIds.FirstOrDefault(id => products.All(p => p.Id != id));
        if (missingProductId != default)
            return Result<DebitNoteDto>.Failure("DN_404_PRODUCT_NOT_FOUND",
                $"Product with ID {missingProductId} was not found.");

        var inactiveProduct = products.FirstOrDefault(p => !p.IsActive);
        if (inactiveProduct != null)
            return Result<DebitNoteDto>.Failure("DN_400_PRODUCT_INACTIVE",
                $"Product '{inactiveProduct.Name.Value}' is inactive.");

        var itemInputs = request.Items.Select(i => new PurchaseOrderCalculator.ItemInput(
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
                return Result<DebitNoteDto>.Failure("DN_400_LINE_DISCOUNT_EXCEEDS",
                    $"Line {idx + 1}: discount amount ({r.LineDiscountAmount}) exceeds line base ({r.LineBase}).");
        }

        if (calc.OverallDiscountAmount > calc.SubtotalAfterLineDiscounts)
            return Result<DebitNoteDto>.Failure("DN_400_OVERALL_DISCOUNT_EXCEEDS",
                $"Overall discount ({calc.OverallDiscountAmount}) exceeds subtotal after line discounts ({calc.SubtotalAfterLineDiscounts}).");

        // Update header
        note.VendorId                    = request.VendorId;
        note.Currency                    = request.Currency;
        note.InvoiceType                 = request.InvoiceType;
        note.BillingAddress              = request.BillingAddress;
        note.Location                    = request.Location;
        note.Terms                       = request.Terms;
        note.NoteDate                    = DateTime.SpecifyKind(request.NoteDate, DateTimeKind.Utc);
        note.DueDate                     = request.DueDate.HasValue ? DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc) : null;
        note.OurRef                      = request.OurRef;
        note.YourRef                     = request.YourRef;
        note.MessageOnNote               = request.MessageOnNote;
        note.DebitAccountId              = request.DebitAccountId;
        note.CreditAccountId             = request.CreditAccountId;
        note.PurchaseInvoiceId           = request.PurchaseInvoiceId;
        note.OverallDiscountType         = request.OverallDiscountType;
        note.OverallDiscountValue        = request.OverallDiscountValue;
        note.Subtotal                    = calc.Subtotal;
        note.TotalLineDiscount           = calc.TotalLineDiscount;
        note.SubtotalAfterLineDiscounts  = calc.SubtotalAfterLineDiscounts;
        note.OverallDiscountAmount       = calc.OverallDiscountAmount;
        note.TotalTaxableAmount          = calc.TotalTaxableAmount;
        note.TotalTax                    = calc.TotalTax;
        note.GrandTotal                  = calc.GrandTotal;

        // Replace items
        note.Items.Clear();
        foreach (var (item, idx) in request.Items.Select((item, idx) => (item, idx)))
        {
            var r = calc.Items[idx];
            note.Items.Add(new Novologs.Domain.Entities.DebitNoteItem
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

        await _repository.UpdateAsync(note, cancellationToken);

        var dto = _mapper.Map<DebitNoteDto>(note);
        return Result<DebitNoteDto>.Success(dto);
    }
}
