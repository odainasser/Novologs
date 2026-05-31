using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ClientLeadConfiguration : IEntityTypeConfiguration<ClientLead>
{
    public void Configure(EntityTypeBuilder<ClientLead> builder)
    {
        builder.HasOne(cl => cl.Creator)
            .WithMany()
            .HasForeignKey(cl => cl.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cl => cl.Client)
            .WithMany(c => c.ClientLeads)
            .HasForeignKey(cl => cl.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(cl => cl.LeadUpdates)
            .WithOne(lu => lu.Lead)
            .HasForeignKey(lu => lu.LeadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cl => cl.SaleStatus)
            .WithMany(ss => ss.ClientLeads)
            .HasForeignKey(cl => cl.SaleStatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cl => cl.RejectionReason)
            .WithMany(rr => rr.ClientLeads)
            .HasForeignKey(cl => cl.RejectionReasonId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
