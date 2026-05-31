using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ProjectTaskMemberConfiguration : IEntityTypeConfiguration<ProjectTaskMember>
{
    public void Configure(EntityTypeBuilder<ProjectTaskMember> builder)
    {
        builder.HasOne(c => c.ProjectTask)
            .WithMany(p => p.Members)
            .HasForeignKey(c => c.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.TenantUser)
            .WithMany(p => p.MemeberTasks)
            .HasForeignKey(c => c.MemberId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(c => c.MemberId)
            .HasDatabaseName("IX_ProjectTaskMembers_MemberId");

        builder.HasIndex(c => c.TaskId)
            .HasDatabaseName("IX_ProjectTaskMembers_TaskId");
    }
}
