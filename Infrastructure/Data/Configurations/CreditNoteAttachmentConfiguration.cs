using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class CreditNoteAttachmentConfiguration : IEntityTypeConfiguration<CreditNoteAttachment>
{
    public void Configure(EntityTypeBuilder<CreditNoteAttachment> builder)
    {
        builder.ToTable("CreditNoteAttachments");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.FileName)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.FileUrl)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(x => x.FilePath)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(x => x.MimeType)
            .HasMaxLength(100);

        builder.Property(x => x.UploadedAt)
            .IsRequired();

        builder.Property(x => x.UploadedBy)
            .HasMaxLength(256)
            .IsRequired();
    }
}
