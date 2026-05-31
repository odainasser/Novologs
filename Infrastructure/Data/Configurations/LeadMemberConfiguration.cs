using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class LeadMemberConfiguration : IEntityTypeConfiguration<LeadMember>
{
    public void Configure(EntityTypeBuilder<LeadMember> builder)
    {
        builder.HasOne(lm => lm.Lead)
            .WithMany(l => l.LeadMembers)
            .HasForeignKey(lm => lm.LeadId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(lm => lm.Member)
            .WithMany()
            .HasForeignKey(lm => lm.MemberId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(lm => lm.LeadId)
            .HasDatabaseName("IX_LeadMembers_LeadId");

        builder.HasIndex(lm => lm.MemberId)
            .HasDatabaseName("IX_LeadMembers_MemberId");
    }
}
