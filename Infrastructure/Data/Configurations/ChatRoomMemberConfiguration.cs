using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ChatRoomMemberConfiguration : IEntityTypeConfiguration<ChatRoomMember>
{
    public void Configure(EntityTypeBuilder<ChatRoomMember> builder)
    {
        builder.HasOne(m => m.Member)
            .WithMany()
            .HasForeignKey(m => m.MemberId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.ChatRoom)
            .WithMany(r => r.Members)
            .HasForeignKey(m => m.ChatRoomId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
