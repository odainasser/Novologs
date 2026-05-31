using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class VendorContractStatusConfiguration : IEntityTypeConfiguration<VendorContractStatus>
{
    public void Configure(EntityTypeBuilder<VendorContractStatus> builder)
    {
        builder.HasOne(vcs => vcs.Name)
            .WithMany()
            .HasForeignKey(vcs => vcs.NameId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
