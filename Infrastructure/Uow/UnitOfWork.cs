using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Novologs.Application.Common.Interfaces;
using Novologs.Infrastructure.Data;

namespace Novologs.Infrastructure.Uow;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _tenantDbContext;
    private IDbContextTransaction? _transaction;
    private IExecutionStrategy? _executionStrategy;

    public UnitOfWork(ApplicationDbContext dbContext)
    {
        _tenantDbContext = dbContext;
    }

    public Task Begin()
    {
        if (_executionStrategy != null)
        {
            throw new InvalidOperationException("A transaction is already in progress.");
        }

        _executionStrategy = _tenantDbContext.Database.CreateExecutionStrategy();
        return Task.CompletedTask;
    }

    public async Task Commit()
    {
        if (_executionStrategy == null)
        {
            throw new InvalidOperationException("No transaction in progress.");
        }

        await _executionStrategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _tenantDbContext.Database.BeginTransactionAsync();
            try
            {
                await _tenantDbContext.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });

        _executionStrategy = null;
    }

    public async Task RollBack()
    {
        _executionStrategy = null;
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await DisposeTransaction();
        }
    }

    private async Task DisposeTransaction()
    {
        if (_transaction != null)
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }
}
