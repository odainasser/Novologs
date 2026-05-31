using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Infrastructure.Data.Configurations;

public class CreditNoteItemConfiguration : IEntityTypeConfiguration<CreditNoteItem>
{
    public void Configure(EntityTypeBuilder<CreditNoteItem> builder)
    {
        builder.ToTable("CreditNoteItems");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.Unit)
            .HasMaxLength(50);

        builder.Property(x => x.Quantity)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.UnitPrice)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.LineDiscountType)
            .IsRequired()
            .HasDefaultValue(DiscountType.Percentage);

        builder.Property(x => x.LineDiscountValue)
            .HasPrecision(18, 4)
            .IsRequired()
            .HasDefaultValue(0m);

        builder.Property(x => x.TaxPercent)
            .HasPrecision(18, 4)
            .IsRequired()
            .HasDefaultValue(0m);

        builder.Property(x => x.LineBase)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.LineDiscountAmount)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.TaxableAmount)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.AllocatedOverallDiscount)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.FinalTaxableAmount)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.TaxAmount)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(x => x.LineTotal)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.HasOne(x => x.Product)
            .WithMany()
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
