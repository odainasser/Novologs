using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        // Configure string properties
        builder.Property(a => a.Code)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(a => a.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(a => a.Level)
            .IsRequired()
            .HasDefaultValue(1);

        // Configure indexes
        // Unique constraint: Code must be unique per database (tenant)
        builder.HasIndex(a => a.Code)
            .IsUnique();

        // Index for filtering by account type
        builder.HasIndex(a => a.AccountType);

        // Index for filtering by category
        builder.HasIndex(a => a.AccountCategory);

        // Index for cascading dropdowns - filter by parent and level
        builder.HasIndex(a => new { a.ParentAccountId, a.Level });

        // Index for level filtering
        builder.HasIndex(a => a.Level);

        // Self-referencing relationship for hierarchical structure
        builder.HasOne(a => a.ParentAccount)
            .WithMany(a => a.ChildAccounts)
            .HasForeignKey(a => a.ParentAccountId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

        // Configure table name
        builder.ToTable("Accounts");
    }
}
