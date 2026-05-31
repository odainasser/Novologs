using System.ComponentModel.DataAnnotations;

namespace Novologs.Domain.Entities;

public class AccountTransaction
{
    public int Id { get; set; }
    public DateTime Date { get; set; }

    [MaxLength(50)]
    public string? ReferenceNo { get; set; }

    [MaxLength(500)]
    public string Description { get; set; } = default!;

    public bool IsPosted { get; set; }
    public DateTime? PostedDate { get; set; }
    public DateTime CreatedAt { get; set; }

    [MaxLength(256)]
    public string CreatedBy { get; set; } = default!;

    public ICollection<AccountTransactionLine> Lines { get; set; } = new List<AccountTransactionLine>();
    public ICollection<AccountTransactionAttachment> Attachments { get; set; } = new List<AccountTransactionAttachment>();
}