using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class DocumentFileConfiguration : IEntityTypeConfiguration<DocumentFile>
{
    public void Configure(EntityTypeBuilder<DocumentFile> builder)
    {
        builder.HasOne(df => df.File)
            .WithMany()
            .HasForeignKey(df => df.FileId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(df => df.DocumentVersion)
            .WithMany(dv => dv.Files)
            .HasForeignKey(df => df.DocumentVersionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
