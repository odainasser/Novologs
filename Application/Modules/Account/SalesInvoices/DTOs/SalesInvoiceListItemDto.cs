using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.SalesInvoices.DTOs;

public class SalesInvoiceListItemDto
{
    public int Id { get; set; }
    public string InvNumber { get; set; } = default!;
    public Guid ClientId { get; set; }
    public ClientSummaryDto? Client { get; set; }
    public string Currency { get; set; } = default!;
    public InvoiceType InvoiceType { get; set; }
    public LocalizedLookupDto? Terms { get; set; }
    public string? Location { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime? DueDate { get; set; }
    public SalesInvoiceStatus Status { get; set; }
    public decimal GrandTotal { get; set; }
    public DateTimeOffset Created { get; set; }
    public UserSummaryDto? CreatedByUser { get; set; }
}

// ClientSummaryDto, UserSummaryDto, LocalizedLookupDto, LocalizedStringItemDto,
// UnitSummaryDto, ProductSummaryDto are in Novologs.Application.Modules.Account.Common.DTOs (global using)
