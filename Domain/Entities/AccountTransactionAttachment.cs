using System.ComponentModel.DataAnnotations;

namespace Novologs.Domain.Entities;

public class AccountTransactionAttachment
{
    public int Id { get; set; }
    public int TransactionId { get; set; }

    [MaxLength(500)]
    public string FileName { get; set; } = default!;

    [MaxLength(2000)]
    public string FileUrl { get; set; } = default!;

    [MaxLength(1000)]
    public string FilePath { get; set; } = default!;

    [MaxLength(100)]
    public string? MimeType { get; set; }

    public long? FileSize { get; set; }
    public DateTime UploadedAt { get; set; }

    [MaxLength(256)]
    public string UploadedBy { get; set; } = default!;

    public AccountTransaction Transaction { get; set; } = default!;
}
