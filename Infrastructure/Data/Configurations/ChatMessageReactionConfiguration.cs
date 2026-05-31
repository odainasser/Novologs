using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ChatMessageReactionConfiguration : IEntityTypeConfiguration<ChatMessageReaction>
{
    public void Configure(EntityTypeBuilder<ChatMessageReaction> builder)
    {
        builder.HasOne(r => r.ChatMessage)
            .WithMany(m => m.Reactions)
            .HasForeignKey(r => r.ChatMessageId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Unique constraint: one reaction per user per message
        builder.HasIndex(r => new { r.ChatMessageId, r.UserId })
            .IsUnique();
    }
}
