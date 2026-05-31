using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Infrastructure.Data.Configurations;

public class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        builder.ToTable("PurchaseOrders");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.PoNumber)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(x => x.PoNumber).IsUnique();

        builder.Property(x => x.VendorId)
            .IsRequired();

        builder.Property(x => x.Currency)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.BillingAddress)
            .HasMaxLength(500);

        builder.Property(x => x.OrderType)
            .HasMaxLength(100);

        builder.Property(x => x.Location)
            .HasMaxLength(200);

        builder.Property(x => x.Terms)
            .HasMaxLength(500);

        builder.Property(x => x.PurchaseDate)
            .IsRequired();

        builder.Property(x => x.OurRef)
            .HasMaxLength(100);

        builder.Property(x => x.YourRef)
            .HasMaxLength(100);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasDefaultValue(PurchaseOrderStatus.Draft);

        builder.Property(x => x.OverallDiscountType)
            .IsRequired()
            .HasDefaultValue(DiscountType.Percentage);

        builder.Property(x => x.OverallDiscountValue)
            .HasPrecision(18, 4)
            .IsRequired()
            .HasDefaultValue(0m);

        builder.Property(x => x.Subtotal)
            .HasPrecision(18, 4)
            .IsRequired()
            .HasDefaultValue(0m);

        builder.Property(x => x.TotalLineDiscount)
            .HasPrecision(18, 4)
            .IsRequired()
            .HasDefaultValue(0m);

        builder.Property(x => x.SubtotalAfterLineDiscounts)
            .HasPrecision(18, 4)
            .IsRequired()
            .HasDefaultValue(0m);

        builder.Property(x => x.OverallDiscountAmount)
            .HasPrecision(18, 4)
            .IsRequired()
            .HasDefaultValue(0m);

        builder.Property(x => x.TotalTaxableAmount)
            .HasPrecision(18, 4)
            .IsRequired()
            .HasDefaultValue(0m);

        builder.Property(x => x.TotalTax)
            .HasPrecision(18, 4)
            .IsRequired()
            .HasDefaultValue(0m);

        builder.Property(x => x.GrandTotal)
            .HasPrecision(18, 4)
            .IsRequired()
            .HasDefaultValue(0m);

        builder.HasIndex(x => x.VendorId);
        builder.HasIndex(x => x.PurchaseDate);
        builder.HasIndex(x => x.Status);

        builder.HasMany(x => x.Items)
            .WithOne(x => x.PurchaseOrder)
            .HasForeignKey(x => x.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
