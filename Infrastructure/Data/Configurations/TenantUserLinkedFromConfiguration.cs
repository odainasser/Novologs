using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class TenantUserLinkedFromConfiguration : IEntityTypeConfiguration<TenantUsersLinkedFrom>
{
    public void Configure(EntityTypeBuilder<TenantUsersLinkedFrom> builder)
    {
        builder.HasOne(t => t.TargetUser)
            .WithMany()
            .HasForeignKey(t => t.TargetUserId)
            .OnDelete(DeleteBehavior.Restrict); 
        
        builder.HasIndex(t => new { t.SourceTenantId, t.SourceUserId, t.TargetUserId })
            .IsUnique();
    }
}
