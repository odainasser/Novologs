using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ProjectInitiativeConfiguration : IEntityTypeConfiguration<ProjectInitiative>
{
    public void Configure(EntityTypeBuilder<ProjectInitiative> builder)
    {
        builder.HasOne(p => p.Name)
            .WithMany()
            .HasForeignKey(p => p.NameId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
