using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Infrastructure.Data.Configurations;

public class CreditNoteConfiguration : IEntityTypeConfiguration<CreditNote>
{
    public void Configure(EntityTypeBuilder<CreditNote> builder)
    {
        builder.ToTable("CreditNotes");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.NoteNumber)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(x => x.NoteNumber).IsUnique();

        builder.Property(x => x.ClientId)
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

        builder.Property(x => x.SalesInvoiceId);

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
            .HasDefaultValue(CreditNoteStatus.Draft);

        builder.Property(x => x.AccountTransactionId);

        builder.HasIndex(x => x.ClientId);
        builder.HasIndex(x => x.NoteDate);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.SalesInvoiceId);

        // FK to SalesInvoice (optional)
        builder.HasOne(x => x.SalesInvoice)
            .WithMany()
            .HasForeignKey(x => x.SalesInvoiceId)
            .OnDelete(DeleteBehavior.SetNull);

        // Children
        builder.HasMany(x => x.Items)
            .WithOne(i => i.CreditNote)
            .HasForeignKey(i => i.CreditNoteId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Attachments)
            .WithOne(a => a.CreditNote)
            .HasForeignKey(a => a.CreditNoteId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
