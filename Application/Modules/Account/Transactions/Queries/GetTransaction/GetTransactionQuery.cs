using Novologs.Application.Modules.Account.Transactions.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.Transactions.Queries.GetTransaction;

[AuthorizePermission(Permissions.Accounting.ReadTransaction)]
public record GetTransactionQuery : IRequest<Result<TransactionDto>>
{
    public int Id { get; init; }
}

public class GetTransactionQueryHandler : IRequestHandler<GetTransactionQuery, Result<TransactionDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetTransactionQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<TransactionDto>> Handle(GetTransactionQuery request, CancellationToken cancellationToken)
    {
        var transaction = await _context.GetSet<Novologs.Domain.Entities.AccountTransaction>()
            .Include(t => t.Lines)
                .ThenInclude(l => l.Account)
                    .ThenInclude(a => a.ParentAccount!)
                        .ThenInclude(p => p.ParentAccount!)
                            .ThenInclude(p => p.ParentAccount!)
                                .ThenInclude(p => p.ParentAccount)
            .Include(t => t.Attachments)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (transaction is null)
            return Result<TransactionDto>.Failure("TXN_404_NOT_FOUND", "Transaction not found.");

        var dto = _mapper.Map<TransactionDto>(transaction);
        return Result<TransactionDto>.Success(dto);
    }
}
