using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ProjectTaskTypeProjectConfiguration : IEntityTypeConfiguration<ProjectTaskTypeProject>
{
    public void Configure(EntityTypeBuilder<ProjectTaskTypeProject> builder)
    {
        builder.HasKey(pt => new { pt.ProjectId, pt.ProjectTaskTypeId });

        builder.HasOne(pt => pt.Project)
            .WithMany(p => p.TaskTypes)
            .HasForeignKey(pt => pt.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(pt => pt.ProjectTaskType)
            .WithMany(p => p.Projects)
            .HasForeignKey(pt => pt.ProjectTaskTypeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
