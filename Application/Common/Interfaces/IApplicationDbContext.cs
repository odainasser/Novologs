namespace Novologs.Application.Common.Interfaces;

/// <summary>
/// Abstraction over the persistence context exposed to the Application layer.
/// Module DbSets are added here as entities are migrated in (Stage 1+).
/// </summary>
public interface IApplicationDbContext
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
