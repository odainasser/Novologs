using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ProjectTaskConfiguration : IEntityTypeConfiguration<ProjectTask>
{
    public void Configure(EntityTypeBuilder<ProjectTask> builder)
    {
        builder.HasOne(c => c.Creator)
            .WithMany()
            .HasForeignKey(c => c.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Project)
            .WithMany(p => p.Tasks)
            .HasForeignKey(c => c.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Status)
            .WithMany()
            .HasForeignKey(c => c.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Category)
            .WithMany()
            .HasForeignKey(c => c.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Priority)
            .WithMany()
            .HasForeignKey(c => c.PriorityId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.ParentTask)
            .WithMany(p => p.ChildTasks)
            .HasForeignKey(c => c.ParentTaskId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.MileStone)
            .WithMany()
            .HasForeignKey(c => c.MileStoneId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Client)
            .WithMany()
            .HasForeignKey(c => c.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.ClientLead)
            .WithMany()
            .HasForeignKey(c => c.ClientLeadId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Vendor)
            .WithMany()
            .HasForeignKey(c => c.VendorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.VendorContract)
            .WithMany()
            .HasForeignKey(c => c.VendorContractId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Members)
            .WithOne(m => m.ProjectTask)
            .HasForeignKey(m => m.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(c => c.CreatorId)
            .HasDatabaseName("IX_ProjectTasks_CreatorId");

        builder.HasIndex(c => c.ProjectId)
            .HasDatabaseName("IX_ProjectTasks_ProjectId");

        builder.HasIndex(c => c.StatusId)
            .HasDatabaseName("IX_ProjectTasks_StatusId");
    }
}
