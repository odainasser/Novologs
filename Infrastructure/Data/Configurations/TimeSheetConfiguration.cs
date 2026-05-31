using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class TimeSheetConfiguration : IEntityTypeConfiguration<TimeSheet>
{
    public void Configure(EntityTypeBuilder<TimeSheet> builder)
    {
        builder.HasOne(ts => ts.User)
            .WithMany()
            .HasForeignKey(ts => ts.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ts => ts.Task)
            .WithMany(t => t.TimeSheets)
            .HasForeignKey(ts => ts.TaskId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
