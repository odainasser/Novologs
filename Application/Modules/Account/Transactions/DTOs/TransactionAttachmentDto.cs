namespace Novologs.Application.Modules.Account.Transactions.DTOs;

public class TransactionAttachmentDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = default!;
    public string FileUrl { get; set; } = default!;
    public string? MimeType { get; set; }
    public long? FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
    public string UploadedBy { get; set; } = default!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.AccountTransactionAttachment, TransactionAttachmentDto>();
        }
    }
}
