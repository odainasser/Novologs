using Finbuckle.MultiTenant.Abstractions;
using Microsoft.EntityFrameworkCore;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data;

/// <summary>
/// Single-DB Finbuckle multitenant store. Reads <see cref="AppTenantInfo"/> rows from the single
/// <see cref="ApplicationDbContext"/>. Tenants are managed elsewhere, so the mutating operations
/// are no-ops.
/// </summary>
public class DatabaseTenantStore : IMultiTenantStore<AppTenantInfo>
{
    private readonly ApplicationDbContext _dbContext;

    public DatabaseTenantStore(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<AppTenantInfo>> GetAllAsync()
    {
        return await _dbContext.GetSet<AppTenantInfo>().ToListAsync();
    }

    public async Task<IEnumerable<AppTenantInfo>> GetAllAsync(int take, int skip)
    {
        return await _dbContext.GetSet<AppTenantInfo>()
            .Skip(skip)
            .Take(take)
            .ToListAsync();
    }

    public async Task<AppTenantInfo?> GetByIdentifierAsync(string identifier)
    {
        identifier = identifier.Trim().ToLower();
        return await _dbContext.GetSet<AppTenantInfo>()
            .FirstOrDefaultAsync(t => t.Identifier == identifier);
    }

    public async Task<AppTenantInfo?> GetAsync(string id)
    {
        if (Guid.TryParse(id, out Guid tenantId))
        {
            return await _dbContext.GetSet<AppTenantInfo>()
                .FirstOrDefaultAsync(t => t.Id == tenantId);
        }

        return null;
    }

    public Task<bool> AddAsync(AppTenantInfo tenantInfo) => Task.FromResult(false);

    public Task<bool> RemoveAsync(string identifier) => Task.FromResult(false);

    public Task<bool> UpdateAsync(AppTenantInfo tenantInfo) => Task.FromResult(false);
}
