using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Client.Leads.Commands.DeleteLead;

public record DeleteLeadCommand : IRequest<Result<DeleteLeadResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteLeadResponse
{
}

public class DeleteLeadCommandValidator : AbstractValidator<DeleteLeadCommand>
{
    public DeleteLeadCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.ClientLead>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Lead not found.");
    }
}

public class DeleteLeadCommandHandler : IRequestHandler<DeleteLeadCommand, Result<DeleteLeadResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public DeleteLeadCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<DeleteLeadResponse>> Handle(DeleteLeadCommand request, CancellationToken cancellationToken)
    {
        var lead = await _context.GetSet<Novologs.Domain.Entities.ClientLead>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (lead == null)
        {
            return Result<DeleteLeadResponse>.Failure("Lead_003", "Lead not found");
        }

        _context.GetSet<Novologs.Domain.Entities.ClientLead>().Remove(lead);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteLeadResponse>.Success(new DeleteLeadResponse());
    }
}
