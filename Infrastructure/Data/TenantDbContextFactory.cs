using Novologs.Application.Common.Interfaces;

namespace Novologs.Infrastructure.Data;

/// <summary>
/// Single-DB implementation of <see cref="ITenantDbContextFactory"/>. In the modular
/// monolith there are no per-tenant databases, so the factory simply returns the
/// scoped <see cref="ApplicationDbContext"/> resolved from DI.
/// </summary>
public class TenantDbContextFactory : ITenantDbContextFactory
{
    private readonly ApplicationDbContext _context;

    public TenantDbContextFactory(ApplicationDbContext context)
    {
        _context = context;
    }

    public ITenantDbContext CreateDbContext() => _context;
}
