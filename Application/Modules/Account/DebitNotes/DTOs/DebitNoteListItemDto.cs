using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.DebitNotes.DTOs;

public class DebitNoteListItemDto
{
    public int Id { get; set; }
    public string NoteNumber { get; set; } = default!;
    public Guid VendorId { get; set; }
    public VendorSummaryDto? Vendor { get; set; }
    public string Currency { get; set; } = default!;
    public InvoiceType InvoiceType { get; set; }
    public string? Location { get; set; }
    public DateTime NoteDate { get; set; }
    public DateTime? DueDate { get; set; }
    public int? PurchaseInvoiceId { get; set; }
    public DebitNoteStatus Status { get; set; }
    public decimal GrandTotal { get; set; }
    public DateTimeOffset Created { get; set; }
    public UserSummaryDto? CreatedByUser { get; set; }
}
