using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class VendorContractConfiguration : IEntityTypeConfiguration<VendorContract>
{
    public void Configure(EntityTypeBuilder<VendorContract> builder)
    {
        builder.HasOne(vc => vc.Creator)
            .WithMany()
            .HasForeignKey(vc => vc.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(vc => vc.Vendor)
            .WithMany(v => v.VendorContracts)
            .HasForeignKey(vc => vc.VendorId)
            .OnDelete(DeleteBehavior.Restrict); 
        
        builder.HasOne(vc => vc.VendorContractType)
            .WithMany(vct => vct.VendorContracts)
            .HasForeignKey(vc => vc.VendorContractTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(vc => vc.VendorContractStatus)
            .WithMany(vcs => vcs.VendorContracts)
            .HasForeignKey(vc => vc.VendorContractStatusId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(vc => vc.Currency)
            .WithMany()
            .HasForeignKey(vc => vc.CurrencyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
