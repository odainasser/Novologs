using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.HasOne(p => p.Department)
            .WithMany()
            .HasForeignKey(p => p.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Creator)
            .WithMany()
            .HasForeignKey(p => p.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(p => p.Client)
            .WithMany()
            .HasForeignKey(p => p.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Goal)
            .WithMany()
            .HasForeignKey(p => p.GoalId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Initiative)
            .WithMany()
            .HasForeignKey(p => p.InitiativeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.ProjectMembers)
            .WithOne(pm => pm.Project)
            .HasForeignKey(pm => pm.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.TaskTypes)
            .WithOne(pt => pt.Project)
            .HasForeignKey(pt => pt.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Modules)
            .WithOne(pm => pm.Project)
            .HasForeignKey(pm => pm.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.MileStones)
            .WithOne(pm => pm.Project)
            .HasForeignKey(pm => pm.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Tasks)
            .WithOne(pt => pt.Project)
            .HasForeignKey(pt => pt.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(p => p.OverviewDocument)
            .WithMany()
            .HasForeignKey(p => p.OverviewDocumentId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(p => p.Type)
            .HasDatabaseName("IX_Projects_Type");

        builder.HasIndex(p => p.CreatorId)
            .HasDatabaseName("IX_Projects_CreatorId");
    }
}
