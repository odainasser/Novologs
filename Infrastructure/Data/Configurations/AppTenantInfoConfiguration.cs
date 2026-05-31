using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

/// <summary>
/// Maps the Finbuckle tenant catalog (single-DB model B). The <c>Owner</c>
/// (ApplicationUser) navigation is ignored so the legacy registration-user table
/// isn't dragged into the model; OwnerId remains a plain column.
/// </summary>
public class AppTenantInfoConfiguration : IEntityTypeConfiguration<AppTenantInfo>
{
    public void Configure(EntityTypeBuilder<AppTenantInfo> builder)
    {
        builder.ToTable("AppTenantInfo");
        builder.HasKey(t => t.Id);
        builder.Ignore(t => t.Owner);
        builder.HasIndex(t => t.Identifier);
    }
}
