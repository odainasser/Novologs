using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class LocalizedStringConfiguration : IEntityTypeConfiguration<LocalizedString>
{
    public void Configure(EntityTypeBuilder<LocalizedString> builder)
    {
        builder.Property(t => t.Value)
            .HasMaxLength(2000)
            .IsRequired();
        builder.Property(t => t.Language)
            .HasMaxLength(10)
            .IsRequired();
    }
}
