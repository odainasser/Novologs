using Novologs.Application.Modules.Account.InvoiceDefaultAccounts.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.InvoiceDefaultAccounts.Commands.CreateInvoiceDefaultAccount;

public record CreateInvoiceDefaultAccountResponse(Guid Id);

[AuthorizePermission(Permissions.Accounting.AddInvoiceDefaultAccount)]
public record CreateInvoiceDefaultAccountCommand : IRequest<Result<CreateInvoiceDefaultAccountResponse>>
{
    public InvoiceCategory InvoiceCategory { get; init; }
    public InvoiceAccountRole InvoiceAccountRole { get; init; }
    public Guid AccountId { get; init; }
}

public class CreateInvoiceDefaultAccountCommandHandler : IRequestHandler<CreateInvoiceDefaultAccountCommand, Result<CreateInvoiceDefaultAccountResponse>>
{
    private readonly ITenantDbContext _context;

    public CreateInvoiceDefaultAccountCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CreateInvoiceDefaultAccountResponse>> Handle(CreateInvoiceDefaultAccountCommand request, CancellationToken cancellationToken)
    {

        // Check (InvoiceCategory + InvoiceAccountRole + AccountId) uniqueness
        var existing = await _context.GetSet<Novologs.Domain.Entities.InvoiceDefaultAccount>()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.InvoiceCategory == request.InvoiceCategory && x.InvoiceAccountRole == request.InvoiceAccountRole && x.AccountId == request.AccountId, cancellationToken);

        if (existing is not null)
        {
            if (!existing.IsDeleted)
                return Result<CreateInvoiceDefaultAccountResponse>.Failure(
                    "INVDEFACC_409_DUPLICATE",
                    $"A default account entry for category '{request.InvoiceCategory}' with role '{request.InvoiceAccountRole}' already exists for the specified account.");

            // Restore soft-deleted record
            existing.IsDeleted = false;
            existing.AccountId = request.AccountId;
            await _context.SaveChangesAsync(cancellationToken);
            return Result<CreateInvoiceDefaultAccountResponse>.Success(new CreateInvoiceDefaultAccountResponse(existing.Id));
        }

        var accountExists = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .AnyAsync(a => a.Id == request.AccountId && !a.IsDeleted, cancellationToken);

        if (!accountExists)
            return Result<CreateInvoiceDefaultAccountResponse>.Failure("INVDEFACC_404_ACCOUNT", $"Account not found.");

        var entity = new Novologs.Domain.Entities.InvoiceDefaultAccount
        {
            InvoiceCategory    = request.InvoiceCategory,
            InvoiceAccountRole = request.InvoiceAccountRole,
            AccountId          = request.AccountId,
        };

        await _context.GetSet<Novologs.Domain.Entities.InvoiceDefaultAccount>().AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<CreateInvoiceDefaultAccountResponse>.Success(new CreateInvoiceDefaultAccountResponse(entity.Id));
    }
}
