using Novologs.Application.Modules.Account.InvoiceDefaultAccounts.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.InvoiceDefaultAccounts.Commands.UpdateInvoiceDefaultAccount;
[AuthorizePermission(Permissions.Accounting.UpdateInvoiceDefaultAccount)]
public record UpdateInvoiceDefaultAccountCommand : IRequest<Result<InvoiceDefaultAccountDto>>
{
    public Guid Id { get; init; }
    public Guid AccountId { get; init; }
}

public class UpdateInvoiceDefaultAccountCommandHandler : IRequestHandler<UpdateInvoiceDefaultAccountCommand, Result<InvoiceDefaultAccountDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateInvoiceDefaultAccountCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<InvoiceDefaultAccountDto>> Handle(UpdateInvoiceDefaultAccountCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.GetSet<Novologs.Domain.Entities.InvoiceDefaultAccount>()
            .FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted, cancellationToken);

        if (entity is null)
            return Result<InvoiceDefaultAccountDto>.Failure("INVDEFACC_404_NOT_FOUND", $"Invoice default account with ID {request.Id} was not found.");

        var accountExists = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .AnyAsync(a => a.Id == request.AccountId && !a.IsDeleted, cancellationToken);

        if (!accountExists)
            return Result<InvoiceDefaultAccountDto>.Failure("INVDEFACC_404_ACCOUNT", "Account not found.");

        entity.AccountId = request.AccountId;

        await _context.SaveChangesAsync(cancellationToken);

        var updated = await _context.GetSet<Novologs.Domain.Entities.InvoiceDefaultAccount>()
            .Include(x => x.Account)
            .AsNoTracking()
            .FirstAsync(x => x.Id == entity.Id, cancellationToken);

        return Result<InvoiceDefaultAccountDto>.Success(_mapper.Map<InvoiceDefaultAccountDto>(updated));
    }
}
