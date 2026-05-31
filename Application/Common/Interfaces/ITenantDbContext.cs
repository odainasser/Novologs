using Microsoft.EntityFrameworkCore;
using Novologs.Domain.Common;

namespace Novologs.Application.Common.Interfaces;

/// <summary>
/// Persistence abstraction exposed to the Application layer. <c>GetSet&lt;T&gt;()</c>
/// gives access to any module's aggregate; the single implementation lives in
/// Infrastructure (the modular-monolith DbContext).
/// </summary>
public interface ITenantDbContext
{
    DbSet<TEntity> GetSet<TEntity>() where TEntity : class;

    IQueryable<TEntity> GetSet<TEntity>(string includeProperties) where TEntity : class;

    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
