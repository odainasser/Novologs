using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class VendorConfiguration : IEntityTypeConfiguration<Vendor>
{
    public void Configure(EntityTypeBuilder<Vendor> builder)
    {
        builder.HasOne(v => v.Creator)
            .WithMany()
            .HasForeignKey(v => v.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
