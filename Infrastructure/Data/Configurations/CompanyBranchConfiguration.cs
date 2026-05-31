using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class CompanyBranchConfiguration : IEntityTypeConfiguration<CompanyBranch>
{
    public void Configure(EntityTypeBuilder<CompanyBranch> builder)
    {
        builder.Property(cb => cb.Name)
            .IsRequired()
            .HasMaxLength(2048);

        builder.Property(cb => cb.Code)
            .HasMaxLength(200);

        builder.Property(cb => cb.Phone)
            .HasMaxLength(20);

        builder.Property(cb => cb.Email)
            .HasMaxLength(256);

        builder.Property(cb => cb.Country)
            .HasMaxLength(100);

        builder.Property(cb => cb.City)
            .HasMaxLength(100);

        builder.Property(cb => cb.Address)
            .HasMaxLength(2048);
    }
}
