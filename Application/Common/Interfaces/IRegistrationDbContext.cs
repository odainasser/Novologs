namespace Novologs.Application.Common.Interfaces;

public interface IRegistrationDbContext
{
    DbSet<TEntity> GetSet<TEntity>() where TEntity : class;
    IQueryable<TEntity> GetSet<TEntity>(string includeProperties) where TEntity : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
