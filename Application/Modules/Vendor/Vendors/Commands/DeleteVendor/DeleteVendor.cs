
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Vendor.Vendors.Commands.DeleteVendor;

public record DeleteVendorCommand : IRequest<Result<DeleteVendorResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteVendorResponse
{
}

public class DeleteVendorCommandValidator : AbstractValidator<DeleteVendorCommand>
{
    public DeleteVendorCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.Vendor>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Vendor not found.");
    }
}

public class DeleteVendorCommandHandler : IRequestHandler<DeleteVendorCommand, Result<DeleteVendorResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public DeleteVendorCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<DeleteVendorResponse>> Handle(DeleteVendorCommand request, CancellationToken cancellationToken)
    {
        var vendor = _context.GetSet<Novologs.Domain.Entities.Vendor>().FirstOrDefault(c => c.Id == request.Id);
        if (vendor == null)
        {
            return Result<DeleteVendorResponse>.Failure("Vendor_002", "Vendor not found");
        }

        // Check if vendor's account has any posted transactions
        var vendorAccount = await _context.GetSet<Novologs.Domain.Entities.VendorAccount>()
            .FirstOrDefaultAsync(va => va.VendorId == request.Id, cancellationToken);

        if (vendorAccount != null)
        {
            var hasPostedTransactions = await _context.GetSet<Novologs.Domain.Entities.AccountTransactionLine>()
                .AnyAsync(tl => tl.AccountId == vendorAccount.AccountId && tl.Transaction.IsPosted, cancellationToken);

            if (hasPostedTransactions)
            {
                return Result<DeleteVendorResponse>.Failure("Vendor_003", "Cannot delete vendor with posted transactions.");
            }

            var account = await _context.GetSet<Novologs.Domain.Entities.Account>()
                .FirstOrDefaultAsync(a => a.Id == vendorAccount.AccountId, cancellationToken);
            if (account != null)
            {
                account.IsDeleted = true;
            }
        }

        _context.GetSet<Novologs.Domain.Entities.Vendor>().Remove(vendor);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteVendorResponse>.Success(new DeleteVendorResponse());

    }
}
