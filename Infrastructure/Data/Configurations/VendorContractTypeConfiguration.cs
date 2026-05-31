using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class VendorContractTypeConfiguration : IEntityTypeConfiguration<VendorContractType>
{
    public void Configure(EntityTypeBuilder<VendorContractType> builder)
    {
        builder.HasOne(vct => vct.Name)
            .WithMany()
            .HasForeignKey(vct => vct.NameId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
