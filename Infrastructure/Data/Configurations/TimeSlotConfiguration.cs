using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class TimeSlotConfiguration : IEntityTypeConfiguration<TimeSlot>
{
    public void Configure(EntityTypeBuilder<TimeSlot> builder)
    {
        builder.HasOne(ts => ts.TimeSheet)
            .WithMany(ts => ts.TimeSlots)
            .HasForeignKey(ts => ts.TimeSheetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
