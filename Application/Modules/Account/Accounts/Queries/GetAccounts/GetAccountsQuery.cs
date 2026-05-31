using Novologs.Application.Modules.Account.Accounts.DTOs;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.Accounts.Queries.GetAccounts;

[AuthorizePermission(Permissions.Accounting.ReadAccount)]
public record GetAccountsQuery : IRequest<Result<List<AccountDto>>>
{
    public AccountType? AccountType { get; init; }
    public AccountCategory? AccountCategory { get; init; }
    public bool? IsActive { get; init; }
}

public class GetAccountsQueryHandler : IRequestHandler<GetAccountsQuery, Result<List<AccountDto>>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetAccountsQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<List<AccountDto>>> Handle(GetAccountsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GetSet<Novologs.Domain.Entities.Account>()
            .Where(a => !a.IsDeleted);

        // Apply filters
        if (request.AccountType.HasValue)
        {
            query = query.Where(a => a.AccountType == request.AccountType.Value);
        }

        if (request.AccountCategory.HasValue)
        {
            query = query.Where(a => a.AccountCategory == request.AccountCategory.Value);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(a => a.IsActive == request.IsActive.Value);
        }

        var accounts = await query
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<AccountDto>>(accounts);
        return Result<List<AccountDto>>.Success(dtos);
    }
}
