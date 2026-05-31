using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class DocumentNodeMemberConfiguration : IEntityTypeConfiguration<DocumentNodeMember>
{
    public void Configure(EntityTypeBuilder<DocumentNodeMember> builder)
    {
        builder.HasOne(dnm => dnm.Member)
            .WithMany()
            .HasForeignKey(dnm => dnm.MemberId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(dnm => dnm.Node)
            .WithMany(dn => dn.Members)
            .HasForeignKey(dnm => dnm.NodeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
