using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Client.Sources.Commands.DeleteSource;

public record DeleteSourceCommand : IRequest<Result<DeleteSourceResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteSourceResponse
{
}

public class DeleteSourceCommandValidator : AbstractValidator<DeleteSourceCommand>
{
    public DeleteSourceCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.LeadSource>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Source not found.");
    }
}

public class DeleteSourceCommandHandler : IRequestHandler<DeleteSourceCommand, Result<DeleteSourceResponse>>
{
    private readonly ITenantDbContext _context;

    public DeleteSourceCommandHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DeleteSourceResponse>> Handle(DeleteSourceCommand request,
        CancellationToken cancellationToken)
    {
        var leadSource = await _context.GetSet<Novologs.Domain.Entities.LeadSource>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (leadSource == null)
        {
            return Result<DeleteSourceResponse>.Failure("Source_003", "Source not found");
        }

        _context.GetSet<Novologs.Domain.Entities.LeadSource>().Remove(leadSource);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteSourceResponse>.Success(new DeleteSourceResponse());
    }
}
