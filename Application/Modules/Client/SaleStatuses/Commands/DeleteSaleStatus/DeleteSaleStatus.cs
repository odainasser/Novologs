using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Client.SaleStatuses.Commands.DeleteSaleStatus;

public record DeleteSaleStatusCommand : IRequest<Result<DeleteSaleStatusResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteSaleStatusResponse
{
}

public class DeleteSaleStatusCommandValidator : AbstractValidator<DeleteSaleStatusCommand>
{
    public DeleteSaleStatusCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.LeadSaleStatus>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Sale Status not found.");
    }
}

public class DeleteSaleStatusCommandHandler : IRequestHandler<DeleteSaleStatusCommand, Result<DeleteSaleStatusResponse>>
{
    private readonly ITenantDbContext _context;

    public DeleteSaleStatusCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DeleteSaleStatusResponse>> Handle(DeleteSaleStatusCommand request,
        CancellationToken cancellationToken)
    {
        var leadSaleStatus = await _context.GetSet<Novologs.Domain.Entities.LeadSaleStatus>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (leadSaleStatus == null)
        {
            return Result<DeleteSaleStatusResponse>.Failure("SaleStatus_003", "Sale Status not found");
        }

        _context.GetSet<Novologs.Domain.Entities.LeadSaleStatus>().Remove(leadSaleStatus);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteSaleStatusResponse>.Success(new DeleteSaleStatusResponse());
    }
}
