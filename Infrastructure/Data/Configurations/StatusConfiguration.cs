using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;
using TaskStatus = Novologs.Domain.Entities.TaskStatus;

namespace Novologs.Infrastructure.Data.Configurations;

public class StatusConfiguration : IEntityTypeConfiguration<TaskStatus>
{
    public void Configure(EntityTypeBuilder<TaskStatus> builder)
    {
        builder.HasOne(c => c.Name)
            .WithMany()
            .HasForeignKey(c => c.NameId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
