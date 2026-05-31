using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class RejectionReasonConfiguration : IEntityTypeConfiguration<LeadRejectionReason>
{
    public void Configure(EntityTypeBuilder<LeadRejectionReason> builder)
    {
        builder.HasOne(rr => rr.Name)
            .WithMany()
            .HasForeignKey(rr => rr.NameId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
