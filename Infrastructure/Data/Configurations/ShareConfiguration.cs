using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ShareConfiguration : IEntityTypeConfiguration<Share>
{
    public void Configure(EntityTypeBuilder<Share> builder)
    {
        builder.HasOne(s => s.Folder)
            .WithMany(f => f.Shares)
            .HasForeignKey(s => s.FolderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(s => s.SharedByUser)
            .WithMany()
            .HasForeignKey(s => s.SharedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.SharedWithUser)
            .WithMany()
            .HasForeignKey(s => s.SharedWithUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
