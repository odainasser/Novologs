using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Vendor.ContractStatuses.Commands.DeleteContractStatus;

public record DeleteContractStatusCommand : IRequest<Result<DeleteContractStatusResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteContractStatusResponse
{
}

public class DeleteContractStatusCommandValidator : AbstractValidator<DeleteContractStatusCommand>
{
    public DeleteContractStatusCommandValidator(ITenantDbContext context, IUser user)
    {
    
    }
}

public class
    DeleteContractStatusCommandHandler : IRequestHandler<DeleteContractStatusCommand,
    Result<DeleteContractStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public DeleteContractStatusCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<DeleteContractStatusResponse>> Handle(DeleteContractStatusCommand request,
        CancellationToken cancellationToken)
    {
        var contractStatus =
            await _context.GetSet<Novologs.Domain.Entities.VendorContractStatus>()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (contractStatus == null)
        {
            return Result<DeleteContractStatusResponse>.Failure("ContractStatus_001", "Contract Status not found.");
        }

        _context.GetSet<Novologs.Domain.Entities.VendorContractStatus>().Remove(contractStatus);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteContractStatusResponse>.Success(new DeleteContractStatusResponse());
    }
}
