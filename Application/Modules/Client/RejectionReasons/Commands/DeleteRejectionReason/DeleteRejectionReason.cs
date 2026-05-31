using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Client.RejectionReasons.Commands.DeleteRejectionReason;

public record DeleteRejectionReasonCommand : IRequest<Result<DeleteRejectionReasonResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteRejectionReasonResponse
{
}

public class DeleteRejectionReasonCommandValidator : AbstractValidator<DeleteRejectionReasonCommand>
{
    public DeleteRejectionReasonCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.LeadRejectionReason>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Rejection Reason not found.");
    }
}

public class
    DeleteRejectionReasonCommandHandler : IRequestHandler<DeleteRejectionReasonCommand,
    Result<DeleteRejectionReasonResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public DeleteRejectionReasonCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<DeleteRejectionReasonResponse>> Handle(DeleteRejectionReasonCommand request,
        CancellationToken cancellationToken)
    {
        var leadRejectionReason = await _context.GetSet<Novologs.Domain.Entities.LeadRejectionReason>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (leadRejectionReason == null)
        {
            return Result<DeleteRejectionReasonResponse>.Failure("RejectionReason_003", "Rejection Reason not found");
        }

        _context.GetSet<Novologs.Domain.Entities.LeadRejectionReason>().Remove(leadRejectionReason);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteRejectionReasonResponse>.Success(new DeleteRejectionReasonResponse());
    }
}
