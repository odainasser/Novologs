using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class LocalizableStringConfiguration : IEntityTypeConfiguration<LocalizableText>
{
    public void Configure(EntityTypeBuilder<LocalizableText> builder)
    {
        builder.Property(t => t.Value)
            .HasMaxLength(2000)
            .IsRequired();
    }
}
