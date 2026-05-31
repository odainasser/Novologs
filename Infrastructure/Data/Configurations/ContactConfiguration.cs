using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class ContactConfiguration : IEntityTypeConfiguration<Contact>
{
    public void Configure(EntityTypeBuilder<Contact> builder)
    {
        builder.HasOne(c => c.Client)
            .WithMany(cl => cl.Contacts)
            .HasForeignKey(c => c.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Vendor)
            .WithMany(v => v.Contacts)
            .HasForeignKey(c => c.VendorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
