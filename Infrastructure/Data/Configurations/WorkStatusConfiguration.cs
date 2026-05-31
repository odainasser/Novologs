using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class WorkStatusConfiguration : IEntityTypeConfiguration<WorkStatus>
{
    public void Configure(EntityTypeBuilder<WorkStatus> builder)
    {
        builder.HasOne(ws => ws.Name)
            .WithMany()
            .HasForeignKey(ws => ws.NameId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
