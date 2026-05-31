using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class LeadSourceConfiguration : IEntityTypeConfiguration<LeadSource>
{
    public void Configure(EntityTypeBuilder<LeadSource> builder)
    {
        builder.HasOne(ls => ls.Name)
            .WithMany()
            .HasForeignKey(ls => ls.NameId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
