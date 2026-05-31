using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ChatMessageTaskConfiguration : IEntityTypeConfiguration<ChatMessageTask>
{
    public void Configure(EntityTypeBuilder<ChatMessageTask> builder)
    {
        builder.HasOne(t => t.ChatMessage)
            .WithMany(m => m.Tasks)
            .HasForeignKey(t => t.ChatMessageId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.Task)
            .WithMany(p => p.ChatMessages)
            .HasForeignKey(t => t.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(t => new { t.ChatMessageId, t.TaskId })
            .IsUnique();
    }
}
