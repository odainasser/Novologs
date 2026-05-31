using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class DocumentNodeConfiguration : IEntityTypeConfiguration<DocumentNode>
{
    public void Configure(EntityTypeBuilder<DocumentNode> builder)
    {
        builder.HasOne(dn => dn.Creator)
            .WithMany()
            .HasForeignKey(dn => dn.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(dn => dn.ParentNode)
            .WithMany(dn => dn.ChildrenNodes)
            .HasForeignKey(dn => dn.ParentNodeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(dn => dn.DocumentCategory)
            .WithMany()
            .HasForeignKey(dn => dn.DocumentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(dn => dn.Folder)
            .WithMany()
            .HasForeignKey(dn => dn.FolderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
