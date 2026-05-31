using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class CommentFileConfiguration : IEntityTypeConfiguration<CommentFile>
{
    public void Configure(EntityTypeBuilder<CommentFile> builder)
    {
        builder.HasOne(f => f.File)
            .WithMany()
            .HasForeignKey(f => f.FileId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.CommentItem)
            .WithMany(i => i.Files)
            .HasForeignKey(f => f.CommentItemId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
