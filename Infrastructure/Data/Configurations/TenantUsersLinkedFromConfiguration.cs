using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class TenantUsersLinkedFromConfiguration : IEntityTypeConfiguration<TenantUsersLinkedFrom>
{
    public void Configure(EntityTypeBuilder<TenantUsersLinkedFrom> builder)
    {
        builder.HasOne(tulf => tulf.TargetUser)
            .WithMany()
            .HasForeignKey(tulf => tulf.TargetUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
