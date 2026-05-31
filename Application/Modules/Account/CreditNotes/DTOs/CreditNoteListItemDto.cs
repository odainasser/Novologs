using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.CreditNotes.DTOs;

public class CreditNoteListItemDto
{
    public int Id { get; set; }
    public string NoteNumber { get; set; } = default!;
    public Guid ClientId { get; set; }
    public ClientSummaryDto? Client { get; set; }
    public string Currency { get; set; } = default!;
    public InvoiceType InvoiceType { get; set; }
    public string? Location { get; set; }
    public DateTime NoteDate { get; set; }
    public DateTime? DueDate { get; set; }
    public int? SalesInvoiceId { get; set; }
    public CreditNoteStatus Status { get; set; }
    public decimal GrandTotal { get; set; }
    public DateTimeOffset Created { get; set; }
    public UserSummaryDto? CreatedByUser { get; set; }
}
