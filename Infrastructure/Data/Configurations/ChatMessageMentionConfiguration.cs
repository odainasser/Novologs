using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ChatMessageMentionConfiguration : IEntityTypeConfiguration<ChatMessageMention>
{
    public void Configure(EntityTypeBuilder<ChatMessageMention> builder)
    {
        builder.HasOne(m => m.User)
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.ChatMessage)
            .WithMany(c => c.Mentions)
            .HasForeignKey(m => m.ChatMessageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
