using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class CommentItemConfiguration : IEntityTypeConfiguration<CommentItem>
{
    public void Configure(EntityTypeBuilder<CommentItem> builder)
    {
        builder.HasOne(i => i.Thread)
            .WithMany(t => t.Items)
            .HasForeignKey(i => i.ThreadId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Sender)
            .WithMany()
            .HasForeignKey(i => i.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(i => i.Files)
            .WithOne(f => f.CommentItem)
            .HasForeignKey(f => f.CommentItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(i => i.Mentions)
            .WithOne(m => m.CommentItem)
            .HasForeignKey(m => m.CommentItemId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
