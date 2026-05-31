using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Infrastructure.Data.Configurations;

public class DebitNoteConfiguration : IEntityTypeConfiguration<DebitNote>
{
    public void Configure(EntityTypeBuilder<DebitNote> builder)
    {
        builder.ToTable("DebitNotes");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.NoteNumber)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(x => x.NoteNumber).IsUnique();

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

        builder.Property(x => x.NoteDate)
            .IsRequired();

        builder.Property(x => x.OurRef)
            .HasMaxLength(100);

        builder.Property(x => x.YourRef)
            .HasMaxLength(100);

        builder.Property(x => x.MessageOnNote)
            .HasMaxLength(1000);

        builder.Property(x => x.DebitAccountId)
            .IsRequired();

        builder.Property(x => x.CreditAccountId)
            .IsRequired();

        builder.Property(x => x.PurchaseInvoiceId);

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
            .HasDefaultValue(DebitNoteStatus.Draft);

        builder.Property(x => x.AccountTransactionId);

        builder.HasIndex(x => x.VendorId);
        builder.HasIndex(x => x.NoteDate);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.PurchaseInvoiceId);

        // FK to PurchaseInvoice (optional)
        builder.HasOne(x => x.PurchaseInvoice)
            .WithMany()
            .HasForeignKey(x => x.PurchaseInvoiceId)
            .OnDelete(DeleteBehavior.SetNull);

        // Children
        builder.HasMany(x => x.Items)
            .WithOne(i => i.DebitNote)
            .HasForeignKey(i => i.DebitNoteId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Attachments)
            .WithOne(a => a.DebitNote)
            .HasForeignKey(a => a.DebitNoteId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
