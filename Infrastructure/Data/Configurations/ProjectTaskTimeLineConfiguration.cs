using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ProjectTaskTimeLineConfiguration : IEntityTypeConfiguration<ProjectTaskTimeLine>
{
    public void Configure(EntityTypeBuilder<ProjectTaskTimeLine> builder)
    {
        builder.HasOne(c => c.ProjectTask)
            .WithMany(p => p.TimeLines)
            .HasForeignKey(c => c.ProjectTaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(c => c.Creator)
            .WithMany()
            .HasForeignKey(c => c.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
