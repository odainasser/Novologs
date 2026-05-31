using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class TenantSettingConfiguration : IEntityTypeConfiguration<Setting>
{
    public void Configure(EntityTypeBuilder<Setting> builder)
    {
        builder.Property(t => t.Key)
            .HasMaxLength(200)
            .IsRequired();
        builder.HasIndex(t => t.Key);

        builder.Property(t => t.Value)
            .HasMaxLength(2000)
            .IsRequired();
        builder.Property(t => t.Extra)
            .HasMaxLength(2000);
    }
}
