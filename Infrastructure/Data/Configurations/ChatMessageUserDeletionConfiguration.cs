using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ChatMessageUserDeletionConfiguration : IEntityTypeConfiguration<ChatMessageUserDeletion>
{
    public void Configure(EntityTypeBuilder<ChatMessageUserDeletion> builder)
    {
        // Ensure a user can only delete a message once
        builder.HasIndex(e => new { e.ChatMessageId, e.UserId })
            .IsUnique()
            .HasDatabaseName("IX_ChatMessageUserDeletion_MessageId_UserId");

        builder.HasOne(e => e.ChatMessage)
            .WithMany()
            .HasForeignKey(e => e.ChatMessageId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
