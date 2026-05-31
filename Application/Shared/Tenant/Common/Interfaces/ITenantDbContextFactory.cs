namespace Novologs.Application.Common.Interfaces;

public interface ITenantDbContextFactory
{
    ITenantDbContext CreateDbContext();
}
