using System.ComponentModel;
using Novologs.Application.Modules.Account.Accounts.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Accounts.Queries.GetAccountLookups;

[AuthorizePermission(Permissions.Accounting.ReadAccount)]
[Description("Returns a lightweight list of all active leaf accounts (Code + Name only) for use in dropdowns and references.")]
public record GetAccountLookupsQuery : IRequest<Result<List<AccountLookupDto>>>;

public class GetAccountLookupsQueryHandler
    : IRequestHandler<GetAccountLookupsQuery, Result<List<AccountLookupDto>>>
{
    private readonly ITenantDbContext _context;

    public GetAccountLookupsQueryHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<AccountLookupDto>>> Handle(
        GetAccountLookupsQuery request,
        CancellationToken cancellationToken)
    {
        // Collect IDs that are parents so we only return leaf (postable) accounts
        var parentIds = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .Where(a => !a.IsDeleted && a.ParentAccountId.HasValue)
            .Select(a => a.ParentAccountId!.Value)
            .ToHashSetAsync(cancellationToken);

        var items = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .Where(a => !a.IsDeleted && a.IsActive && !parentIds.Contains(a.Id) && !a.IsSubcategory)
            .OrderBy(a => a.Code)
            .Select(a => new AccountLookupDto { Code = a.Code, Name = a.Name })
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Result<List<AccountLookupDto>>.Success(items);
    }
}
