using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class TenantUserLinkedToConfiguration : IEntityTypeConfiguration<TenantUsersLinkedTo>
{
    public void Configure(EntityTypeBuilder<TenantUsersLinkedTo> builder)
    {
        builder.HasOne(t => t.SourceUser)
            .WithMany()
            .HasForeignKey(t => t.SourceUserId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(t => new { t.SourceUserId, t.TargetTenantId, t.TargetUserId })
            .IsUnique();
    }
}
