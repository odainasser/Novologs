using Novologs.Application.Modules.Account.Accounts.DTOs;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Modules.Account.Transactions.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Novologs.Application.Modules.Account.Accounts.Queries.GetAccount;

[AuthorizePermission(Permissions.Accounting.ReadAccount)]
public record GetAccountQuery : IRequest<Result<AccountDto>>
{
    public Guid Id { get; init; }
}

public class GetAccountQueryHandler : IRequestHandler<GetAccountQuery, Result<AccountDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetAccountQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AccountDto>> Handle(GetAccountQuery request, CancellationToken cancellationToken)
    {
        var account = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .FirstOrDefaultAsync(a => a.Id == request.Id && !a.IsDeleted, cancellationToken);

        if (account == null)
        {
            return Result<AccountDto>.Failure("Account_008", "Account not found.");
        }

        var dto = _mapper.Map<AccountDto>(account);
        // Load recent transactions (most recent 50) that involve this account via any transaction line
        var transactionsQuery = _context.GetSet<Novologs.Domain.Entities.AccountTransaction>()
            .Include(t => t.Lines)
                .ThenInclude(l => l.Account)
            .Include(t => t.Attachments)
            .AsNoTracking()
            .Where(t => t.Lines.Any(l => l.AccountId == request.Id) && t.IsPosted)
            .OrderByDescending(t => t.Date).ThenByDescending(t => t.Id)
            .Take(50);

        var transactions = await transactionsQuery.ToListAsync(cancellationToken);
        dto.Transactions = _mapper.Map<List<TransactionDto>>(transactions);
        return Result<AccountDto>.Success(dto);
    }
}
