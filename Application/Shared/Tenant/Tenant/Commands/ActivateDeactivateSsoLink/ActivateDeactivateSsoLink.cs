using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Tenant.Commands.ActivateDeactivateSsoLink;

public record ActivateDeactivateSsoLinkCommand : IRequest<Result<ActivateDeactivateSsoLinkResponse>>
{
    public LinkDirection LinkDirection { get; set; }
    public Guid LinkId { get; set; }
    public bool? IsActive { get; set; }
}

public class ActivateDeactivateSsoLinkResponse
{
    public Guid LinkId { get; set; }
    public bool IsActive { get; set; }
}

public class ActivateDeactivateSsoLinkCommandValidator : AbstractValidator<ActivateDeactivateSsoLinkCommand>
{
    public ActivateDeactivateSsoLinkCommandValidator()
    {
        RuleFor(v => v.LinkId).NotEmpty();
    }
}

public class ActivateDeactivateSsoLinkCommandHandler : IRequestHandler<ActivateDeactivateSsoLinkCommand,
    Result<ActivateDeactivateSsoLinkResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public ActivateDeactivateSsoLinkCommandHandler(
        ITenantDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<Result<ActivateDeactivateSsoLinkResponse>> Handle(ActivateDeactivateSsoLinkCommand request,
        CancellationToken cancellationToken)
    {
        if (request.LinkDirection == LinkDirection.To)
        {
            var linkTo = await _context.GetSet<TenantUsersLinkedTo>()
                .FirstOrDefaultAsync(l => l.Id == request.LinkId, cancellationToken);

            if (linkTo != null)
            {
                if (request.IsActive.HasValue && request.IsActive.Value != linkTo.IsActive)
                {
                    linkTo.IsActive = request.IsActive.Value;
                    await _context.SaveChangesAsync(cancellationToken);
                }

                return Result<ActivateDeactivateSsoLinkResponse>.Success(
                    new ActivateDeactivateSsoLinkResponse { LinkId = linkTo.Id, IsActive = linkTo.IsActive });
            }
        }

        else if (request.LinkDirection == LinkDirection.From)
        {
            var linkFrom = await _context.GetSet<TenantUsersLinkedFrom>()
                .FirstOrDefaultAsync(l => l.Id == request.LinkId, cancellationToken);

            if (linkFrom != null)
            {
                if (request.IsActive.HasValue && request.IsActive.Value != linkFrom.IsActive)
                {
                    linkFrom.IsActive = request.IsActive.Value;
                    await _context.SaveChangesAsync(cancellationToken);
                }

                return Result<ActivateDeactivateSsoLinkResponse>.Success(
                    new ActivateDeactivateSsoLinkResponse { LinkId = linkFrom.Id, IsActive = linkFrom.IsActive });
            }
        }

        return Result<ActivateDeactivateSsoLinkResponse>.Failure("SsoLink.NotFound",
            "SSO link not found or you don't have permission to modify it.");
    }
}
