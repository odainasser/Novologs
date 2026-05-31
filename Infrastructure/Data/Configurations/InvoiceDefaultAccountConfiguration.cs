using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class InvoiceDefaultAccountConfiguration : IEntityTypeConfiguration<InvoiceDefaultAccount>
{
    public void Configure(EntityTypeBuilder<InvoiceDefaultAccount> builder)
    {
        builder.ToTable("InvoiceDefaultAccounts");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.InvoiceCategory)
            .IsRequired();

        builder.Property(x => x.InvoiceAccountRole)
            .IsRequired();

        builder.Property(x => x.AccountId)
            .IsRequired();

        builder.HasIndex(x => new { x.InvoiceCategory, x.InvoiceAccountRole, x.AccountId })
            .IsUnique();

        builder.HasIndex(x => x.AccountId);

        builder.HasOne(x => x.Account)
            .WithMany()
            .HasForeignKey(x => x.AccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
