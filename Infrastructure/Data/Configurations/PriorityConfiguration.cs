using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class PriorityConfiguration : IEntityTypeConfiguration<TaskPriority>
{
    public void Configure(EntityTypeBuilder<TaskPriority> builder)
    {
        builder.HasOne(c => c.Name)
            .WithMany()
            .HasForeignKey(c => c.NameId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
