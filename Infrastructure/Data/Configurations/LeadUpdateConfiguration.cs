using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class LeadUpdateConfiguration : IEntityTypeConfiguration<LeadUpdate>
{
    public void Configure(EntityTypeBuilder<LeadUpdate> builder)
    {
        builder.Property(lu => lu.Description)
            .IsRequired()
            .HasMaxLength(4096);

        builder.Property(lu => lu.Status)
            .HasMaxLength(500);

        builder.HasOne(lu => lu.Lead)
            .WithMany(cl => cl.LeadUpdates)
            .HasForeignKey(lu => lu.LeadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(lu => lu.Creator)
            .WithMany()
            .HasForeignKey(lu => lu.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(lu => lu.TodoItems)
            .WithOne(t => t.LeadUpdate)
            .HasForeignKey(t => t.LeadUpdateId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
