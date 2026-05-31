using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.PurchaseOrders.DTOs;

public class PurchaseOrderListItemDto
{
    public int Id { get; set; }
    public string PoNumber { get; set; } = default!;
    public Guid VendorId { get; set; }
    public VendorSummaryDto? Vendor { get; set; }
    public string Currency { get; set; } = default!;
    public LocalizedLookupDto? OrderType { get; set; }
    public LocalizedLookupDto? Terms { get; set; }
    public string? Location { get; set; }
    public DateTime PurchaseDate { get; set; }
    public DateTime? DueDate { get; set; }
    public PurchaseOrderStatus Status { get; set; }
    public decimal GrandTotal { get; set; }
    public DateTimeOffset Created { get; set; }
    public UserSummaryDto? CreatedByUser { get; set; }
}

// VendorSummaryDto, UserSummaryDto, LocalizedLookupDto, LocalizedStringItemDto
// are in Novologs.Application.Modules.Account.Common.DTOs (global using)
