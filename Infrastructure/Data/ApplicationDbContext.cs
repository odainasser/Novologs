using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Common;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data;

/// <summary>
/// Single EF Core context for the modular monolith. Derives from
/// <see cref="IdentityDbContext{TUser,TRole,TKey}"/> so the tenant user/role
/// store maps to the standard AspNet* tables. Entity configurations are
/// discovered per-module via <see cref="ModelBuilder.ApplyConfigurationsFromAssembly"/>.
/// Implements <see cref="ITenantDbContext"/> — the abstraction the Application
/// layer queries through (<c>GetSet&lt;T&gt;()</c>).
/// </summary>
public class ApplicationDbContext : IdentityDbContext<TenantUser, IdentityRole<Guid>, Guid>, ITenantDbContext, IApplicationDbContext, IRegistrationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    public DbSet<TEntity> GetSet<TEntity>() where TEntity : class => Set<TEntity>();

    public IQueryable<TEntity> GetSet<TEntity>(string includeProperties) where TEntity : class
    {
        IQueryable<TEntity> query = Set<TEntity>();
        foreach (var include in includeProperties.Split(',', StringSplitOptions.RemoveEmptyEntries))
        {
            query = query.Include(include.Trim());
        }

        return query;
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // Default money precision for all decimal columns (avoids silent-truncation warnings).
        configurationBuilder.Properties<decimal>().HavePrecision(18, 2);
        base.ConfigureConventions(configurationBuilder);
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
