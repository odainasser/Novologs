using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class AccountTransactionLineConfiguration : IEntityTypeConfiguration<AccountTransactionLine>
{
    public void Configure(EntityTypeBuilder<AccountTransactionLine> builder)
    {
        builder.ToTable("TransactionLines");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();

        builder.Property(x => x.Debit)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Credit)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        builder.HasIndex(x => x.AccountId);

        builder.HasOne(x => x.Account)
            .WithMany()
            .HasForeignKey(x => x.AccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}