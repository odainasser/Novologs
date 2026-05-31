using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class CommentThreadConfiguration : IEntityTypeConfiguration<CommentThread>
{
    public void Configure(EntityTypeBuilder<CommentThread> builder)
    {
        builder.HasMany(t => t.Items)
            .WithOne(i => i.Thread)
            .HasForeignKey(i => i.ThreadId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
