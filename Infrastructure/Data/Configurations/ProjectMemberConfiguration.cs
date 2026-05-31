using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ProjectMemberConfiguration : IEntityTypeConfiguration<ProjectMember>
{
    public void Configure(EntityTypeBuilder<ProjectMember> builder)
    {
        builder.HasOne(pm => pm.Project)
            .WithMany(p => p.ProjectMembers)
            .HasForeignKey(pm => pm.ProjectId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(pm => pm.Member)
            .WithMany(m => m.MemberProjects)
            .HasForeignKey(pm => pm.MemberId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(pm => pm.MemberId)
            .HasDatabaseName("IX_ProjectMembers_MemberId");

        builder.HasIndex(pm => pm.ProjectId)
            .HasDatabaseName("IX_ProjectMembers_ProjectId");
    }
}
