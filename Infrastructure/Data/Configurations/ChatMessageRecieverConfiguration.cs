using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ChatMessageRecieverConfiguration : IEntityTypeConfiguration<ChatMessageReciever>
{
    public void Configure(EntityTypeBuilder<ChatMessageReciever> builder)
    {
        builder.HasOne(r => r.ChatMessage)
            .WithMany(m => m.Recievers)
            .HasForeignKey(r => r.ChatMessageId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Reciever)
            .WithMany()
            .HasForeignKey(r => r.RecieverId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
