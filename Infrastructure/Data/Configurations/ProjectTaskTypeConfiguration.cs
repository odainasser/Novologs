using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ProjectTaskTypeConfiguration : IEntityTypeConfiguration<ProjectTaskType>
{
    public void Configure(EntityTypeBuilder<ProjectTaskType> builder)
    {
        builder.HasOne(p => p.Name)
            .WithMany()
            .HasForeignKey(p => p.NameId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
