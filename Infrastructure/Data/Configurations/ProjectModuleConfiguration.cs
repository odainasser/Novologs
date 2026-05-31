using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ProjectModuleConfiguration : IEntityTypeConfiguration<ProjectModule>
{
    public void Configure(EntityTypeBuilder<ProjectModule> builder)
    {
        builder.HasOne(p => p.Name)
            .WithMany()
            .HasForeignKey(p => p.NameId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(p => p.Project)
            .WithMany(p => p.Modules)
            .HasForeignKey(p => p.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
