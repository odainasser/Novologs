using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class AccountTransactionConfiguration : IEntityTypeConfiguration<AccountTransaction>
{
    public void Configure(EntityTypeBuilder<AccountTransaction> builder)
    {
        builder.ToTable("Transactions");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.Date)
            .IsRequired();

        builder.Property(x => x.ReferenceNo)
            .HasMaxLength(50)
            .IsRequired(false);

        builder.Property(x => x.Description)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.IsPosted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.PostedDate)
            .IsRequired(false);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(256)
            .IsRequired();

        builder.HasIndex(x => x.Date);

        builder.HasMany(x => x.Lines)
            .WithOne(x => x.Transaction)
            .HasForeignKey(x => x.TransactionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}