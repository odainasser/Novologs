using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class TenantUsersLinkedToConfiguration : IEntityTypeConfiguration<TenantUsersLinkedTo>
{
    public void Configure(EntityTypeBuilder<TenantUsersLinkedTo> builder)
    {
        builder.HasOne(tult => tult.SourceUser)
            .WithMany()
            .HasForeignKey(tult => tult.SourceUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
