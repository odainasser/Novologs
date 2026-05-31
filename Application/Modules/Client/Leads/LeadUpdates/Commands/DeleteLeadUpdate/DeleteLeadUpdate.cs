using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Client.Leads.LeadUpdates.Commands.DeleteLeadUpdate;

[AuthorizePermission(Novologs.Domain.Constants.Permissions.Clients.DeleteLeadUpdate)]
public record DeleteLeadUpdateCommand : IRequest<Result<DeleteLeadUpdateResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteLeadUpdateResponse { }

public class DeleteLeadUpdateCommandValidator : AbstractValidator<DeleteLeadUpdateCommand>
{
    public DeleteLeadUpdateCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
                await context.GetSet<Novologs.Domain.Entities.LeadUpdate>()
                    .AnyAsync(lu => lu.Id == id, cancellationToken))
            .WithMessage("LeadUpdate not found.");
    }
}

public class DeleteLeadUpdateCommandHandler : IRequestHandler<DeleteLeadUpdateCommand, Result<DeleteLeadUpdateResponse>>
{
    private readonly ITenantDbContext _context;

    public DeleteLeadUpdateCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DeleteLeadUpdateResponse>> Handle(DeleteLeadUpdateCommand request, CancellationToken cancellationToken)
    {
        var leadUpdate = await _context.GetSet<Novologs.Domain.Entities.LeadUpdate>()
            .FirstOrDefaultAsync(lu => lu.Id == request.Id, cancellationToken);

        if (leadUpdate == null)
            return Result<DeleteLeadUpdateResponse>.Failure("LeadUpdate_002", "LeadUpdate not found.");

        _context.GetSet<Novologs.Domain.Entities.LeadUpdate>().Remove(leadUpdate);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteLeadUpdateResponse>.Success(new DeleteLeadUpdateResponse());
    }
}
