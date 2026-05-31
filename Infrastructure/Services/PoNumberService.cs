using Novologs.Application.Modules.Account.PurchaseOrders.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Data.Common;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Infrastructure.Services;

/// <summary>
/// Generates unique PO numbers using a PostgreSQL sequence (po_number_seq).
/// The sequence is created lazily on first use — no migration required.
/// A single shared database holds one sequence (tenancy model B).
/// </summary>
public sealed class PoNumberService : IPoNumberService
{
    private readonly ITenantDbContext _context;

    public PoNumberService(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<string> GeneratePoNumberAsync(CancellationToken cancellationToken = default)
    {
        var dbContext = (Microsoft.EntityFrameworkCore.DbContext)_context;
        var connection = dbContext.Database.GetDbConnection();

        var shouldClose = connection.State != ConnectionState.Open;
        if (shouldClose)
            await connection.OpenAsync(cancellationToken);

        try
        {
            // Idempotent: no-op if sequence already exists.
            await using (var createCmd = connection.CreateCommand())
            {
                createCmd.CommandText =
                    "CREATE SEQUENCE IF NOT EXISTS po_number_seq " +
                    "START WITH 1 INCREMENT BY 1 NO CYCLE;";
                await createCmd.ExecuteNonQueryAsync(cancellationToken);
            }

            // Atomically claim the next value — guaranteed unique under concurrency.
            await using (var nextCmd = connection.CreateCommand())
            {
                nextCmd.CommandText = "SELECT nextval('po_number_seq');";
                var result = await nextCmd.ExecuteScalarAsync(cancellationToken);
                var nextVal = Convert.ToInt64(result);
                return $"PO-{nextVal:D4}";
            }
        }
        finally
        {
            if (shouldClose)
                await connection.CloseAsync();
        }
    }
}
