using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.PurchaseInvoices.DTOs;

public class PurchaseInvoiceListItemDto
{
    public int Id { get; set; }
    public string InvNumber { get; set; } = default!;
    public Guid VendorId { get; set; }
    public VendorSummaryDto? Vendor { get; set; }
    public string Currency { get; set; } = default!;
    public InvoiceType InvoiceType { get; set; }
    public LocalizedLookupDto? Terms { get; set; }
    public string? Location { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime? DueDate { get; set; }
    public int? PurchaseOrderId { get; set; }
    public PurchaseInvoiceStatus Status { get; set; }
    public decimal GrandTotal { get; set; }
    public DateTimeOffset Created { get; set; }
    public UserSummaryDto? CreatedByUser { get; set; }
}

// VendorSummaryDto, UserSummaryDto, LocalizedLookupDto, LocalizedStringItemDto,
// UnitSummaryDto, ProductSummaryDto are in Novologs.Application.Modules.Account.Common.DTOs (global using)
