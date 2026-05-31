using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Vendor.Contracts.Commands.DeleteContract;

public record DeleteContractCommand : IRequest<Result<DeleteContractResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteContractResponse
{
}

public class DeleteContractCommandValidator : AbstractValidator<DeleteContractCommand>
{
    public DeleteContractCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.VendorContract>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Contract not found.");
    }
}

public class DeleteContractCommandHandler : IRequestHandler<DeleteContractCommand, Result<DeleteContractResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public DeleteContractCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<DeleteContractResponse>> Handle(DeleteContractCommand request,
        CancellationToken cancellationToken)
    {
        var contract = _context.GetSet<Novologs.Domain.Entities.VendorContract>().FirstOrDefault(c => c.Id == request.Id);
        if (contract == null)
        {
            return Result<DeleteContractResponse>.Failure("Contract_002", "Contract not found");
        }

        _context.GetSet<Novologs.Domain.Entities.VendorContract>().Remove(contract);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteContractResponse>.Success(new DeleteContractResponse());
    }
}
