using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class UserPermissionConfiguration : IEntityTypeConfiguration<UserPermission>
{
    public void Configure(EntityTypeBuilder<UserPermission> builder)
    {
        builder.HasIndex(up => up.UserId)
            .HasDatabaseName("IX_UserPermissions_UserId");

        builder.HasIndex(up => up.PermissionId)
            .HasDatabaseName("IX_UserPermissions_PermissionId");
    }
}
