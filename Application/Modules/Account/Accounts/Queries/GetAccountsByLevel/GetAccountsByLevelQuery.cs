using Novologs.Application.Modules.Account.Accounts.DTOs;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Account.Accounts.Queries.GetAccountsByLevel;
[AuthorizePermission(Permissions.Accounting.ReadAccount)]
public record GetAccountsByLevelQuery : IRequest<Result<List<AccountDto>>>
{
    public int Level { get; init; }
    public Guid? ParentAccountId { get; init; }
    public bool? IsActive { get; init; }
}

public class GetAccountsByLevelQueryHandler : IRequestHandler<GetAccountsByLevelQuery, Result<List<AccountDto>>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetAccountsByLevelQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<List<AccountDto>>> Handle(GetAccountsByLevelQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GetSet<Novologs.Domain.Entities.Account>()
            .Include(a => a.ParentAccount)
            .Include(a => a.ChildAccounts)
            .Where(a => !a.IsDeleted && a.Level == request.Level);

        // Filter by parent if specified
        if (request.ParentAccountId.HasValue)
        {
            query = query.Where(a => a.ParentAccountId == request.ParentAccountId.Value);
        }
        else if (request.Level > 1)
        {
            // For levels > 1, if no parent specified, return empty list (must select parent first)
            return Result<List<AccountDto>>.Success(new List<AccountDto>());
        }

        // Filter by active status if specified
        if (request.IsActive.HasValue)
        {
            query = query.Where(a => a.IsActive == request.IsActive.Value);
        }

        var accounts = await query
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<AccountDto>>(accounts);
        
        // Build full path for each account
        foreach (var dto in dtos)
        {
            dto.FullPath = await BuildFullPathAsync(dto.Id, cancellationToken);
        }

        return Result<List<AccountDto>>.Success(dtos);
    }

    private async Task<string> BuildFullPathAsync(Guid accountId, CancellationToken cancellationToken)
    {
        var path = new List<string>();
        var currentAccount = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .Include(a => a.ParentAccount)
            .FirstOrDefaultAsync(a => a.Id == accountId, cancellationToken);

        while (currentAccount != null)
        {
            path.Insert(0, currentAccount.Name);
            currentAccount = currentAccount.ParentAccount;
        }

        return string.Join(" > ", path);
    }
}
