using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Vendor.ContractTypes.Commands.DeleteContractType;

public record DeleteContractTypeCommand : IRequest<Result<DeleteContractTypeResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteContractTypeResponse
{
}

public class DeleteContractTypeCommandValidator : AbstractValidator<DeleteContractTypeCommand>
{
    public DeleteContractTypeCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.VendorContractType>()
                    .AnyAsync(vct => vct.Id == id, cancellationToken);
            }).WithMessage("Contract Type not found.");

        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return !await context.GetSet<Novologs.Domain.Entities.VendorContract>()
                    .AnyAsync(vc => vc.VendorContractTypeId == id, cancellationToken);
            }).WithMessage("Cannot delete contract type as it is associated with existing contracts.");
    }
}

public class
    DeleteContractTypeCommandHandler : IRequestHandler<DeleteContractTypeCommand, Result<DeleteContractTypeResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public DeleteContractTypeCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<DeleteContractTypeResponse>> Handle(DeleteContractTypeCommand request,
        CancellationToken cancellationToken)
    {
        var contractType =
            await _context.GetSet<Novologs.Domain.Entities.VendorContractType>()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (contractType == null)
        {
            return Result<DeleteContractTypeResponse>.Failure("ContractType_001", "Contract Type not found.");
        }

        _context.GetSet<Novologs.Domain.Entities.VendorContractType>().Remove(contractType);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteContractTypeResponse>.Success(new DeleteContractTypeResponse());
    }
}
