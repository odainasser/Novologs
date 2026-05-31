using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ProjectMileStoneConfiguration : IEntityTypeConfiguration<ProjectMileStone>
{
    public void Configure(EntityTypeBuilder<ProjectMileStone> builder)
    {
        builder.HasOne(p => p.Project)
            .WithMany(p => p.MileStones)
            .HasForeignKey(p => p.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
