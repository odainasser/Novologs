using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class DocumentVersionConfiguration : IEntityTypeConfiguration<DocumentVersion>
{
    public void Configure(EntityTypeBuilder<DocumentVersion> builder)
    {
        builder.HasOne(dv => dv.HeaderImgFile)
            .WithMany()
            .HasForeignKey(dv => dv.HeaderImgFileId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(dv => dv.Node)
            .WithMany(dn => dn.DocumentVersionList)
            .HasForeignKey(dv => dv.NodeId)
            .OnDelete(DeleteBehavior.Cascade);
        
    }
}
