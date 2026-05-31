using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ProductTermConfiguration : IEntityTypeConfiguration<ProductTerm>
{
    public void Configure(EntityTypeBuilder<ProductTerm> builder)
    {
        builder.HasOne(c => c.Name)
            .WithMany()
            .HasForeignKey(c => c.NameId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
