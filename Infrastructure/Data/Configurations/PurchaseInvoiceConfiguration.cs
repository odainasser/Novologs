using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Infrastructure.Data.Configurations;

public class PurchaseInvoiceConfiguration : IEntityTypeConfiguration<PurchaseInvoice>
{
    public void Configure(EntityTypeBuilder<PurchaseInvoice> builder)
    {
        builder.ToTable("PurchaseInvoices");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.InvNumber)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(x => x.InvNumber).IsUnique();

        builder.Property(x => x.VendorId)
            .IsRequired();

        builder.Property(x => x.Currency)
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.InvoiceType)
            .IsRequired()
            .HasDefaultValue(InvoiceType.TaxCashInvoice);

        builder.Property(x => x.BillingAddress)
            .HasMaxLength(500);

        builder.Property(x => x.Location)
            .HasMaxLength(200);

        builder.Property(x => x.Terms)
            .HasMaxLength(500);

        builder.Property(x => x.InvoiceDate)
            .IsRequired();

        builder.Property(x => x.OurRef)
            .HasMaxLength(100);

        builder.Property(x => x.YourRef)
            .HasMaxLength(100);

        builder.Property(x => x.MessageOnInvoice)
            .HasMaxLength(1000);

        builder.Property(x => x.DebitAccountId)
            .IsRequired();

        builder.Property(x => x.CreditAccountId)
            .IsRequired();

        builder.Property(x => x.PurchaseOrderId);

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

        builder.Property(x => x.Status)
            .IsRequired()
            .HasDefaultValue(PurchaseInvoiceStatus.Draft);

        builder.Property(x => x.AccountTransactionId);

        builder.HasIndex(x => x.VendorId);
        builder.HasIndex(x => x.InvoiceDate);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.PurchaseOrderId);

        // FK to PurchaseOrder (optional)
        builder.HasOne(x => x.PurchaseOrder)
            .WithMany()
            .HasForeignKey(x => x.PurchaseOrderId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasMany(x => x.Items)
            .WithOne(x => x.PurchaseInvoice)
            .HasForeignKey(x => x.PurchaseInvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Attachments)
            .WithOne(x => x.PurchaseInvoice)
            .HasForeignKey(x => x.PurchaseInvoiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
