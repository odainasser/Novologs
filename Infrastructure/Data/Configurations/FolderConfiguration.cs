using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class FolderConfiguration : IEntityTypeConfiguration<Folder>
{
    public void Configure(EntityTypeBuilder<Folder> builder)
    {
        builder.HasOne(f => f.ParentFolder)
            .WithMany(f => f.Subfolders)
            .HasForeignKey(f => f.ParentFolderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.Creator)
            .WithMany()
            .HasForeignKey(f => f.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(f => f.ProjectId)
            .HasDatabaseName("IX_Folders_ProjectId");

        builder.HasIndex(f => f.Type)
            .HasDatabaseName("IX_Folders_Type");

        builder.HasIndex(f => f.TaskId)
            .HasDatabaseName("IX_Folders_TaskId");

        builder.HasIndex(f => f.LeadId)
            .HasDatabaseName("IX_Folders_LeadId");

        builder.HasIndex(f => f.ChatRoomId)
            .HasDatabaseName("IX_Folders_ChatRoomId");
    }
}
