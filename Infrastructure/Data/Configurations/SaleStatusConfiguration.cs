using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class SaleStatusConfiguration : IEntityTypeConfiguration<LeadSaleStatus>
{
    public void Configure(EntityTypeBuilder<LeadSaleStatus> builder)
    {
        builder.HasOne(ss => ss.Name)
            .WithMany()
            .HasForeignKey(ss => ss.NameId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
