using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class VendorAccountConfiguration : IEntityTypeConfiguration<VendorAccount>
{
    public void Configure(EntityTypeBuilder<VendorAccount> builder)
    {
        builder.HasOne(va => va.Vendor)
            .WithMany()
            .HasForeignKey(va => va.VendorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(va => va.Account)
            .WithMany()
            .HasForeignKey(va => va.AccountId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(va => va.VendorId).IsUnique();
        builder.HasIndex(va => va.AccountId).IsUnique();
    }
}
