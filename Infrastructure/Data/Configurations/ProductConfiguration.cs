using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.NameId)
            .IsRequired();

        builder.HasOne(x => x.Name)
            .WithMany()
            .HasForeignKey(x => x.NameId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.Property(x => x.Unit)
            .HasMaxLength(50);

        builder.Property(x => x.TaxPercentage)
            .HasColumnType("decimal(5,2)");

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);
    }
}
