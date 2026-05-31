using Novologs.Application.Modules.Account.InvoiceDefaultAccounts.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.InvoiceDefaultAccounts.Queries.GetInvoiceDefaultAccount;
[AuthorizePermission(Permissions.Accounting.ReadInvoiceDefaultAccount)]
public record GetInvoiceDefaultAccountQuery(Guid Id) : IRequest<Result<InvoiceDefaultAccountDto>>;

public class GetInvoiceDefaultAccountQueryHandler : IRequestHandler<GetInvoiceDefaultAccountQuery, Result<InvoiceDefaultAccountDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetInvoiceDefaultAccountQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<InvoiceDefaultAccountDto>> Handle(GetInvoiceDefaultAccountQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.GetSet<Novologs.Domain.Entities.InvoiceDefaultAccount>()
            .Include(x => x.Account)
            .Where(x => x.Id == request.Id && !x.IsDeleted)
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);

        if (entity is null)
            return Result<InvoiceDefaultAccountDto>.Failure("INVDEFACC_404_NOT_FOUND", $"Invoice default account with ID {request.Id} was not found.");

        return Result<InvoiceDefaultAccountDto>.Success(_mapper.Map<InvoiceDefaultAccountDto>(entity));
    }
}
