using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Tenant.Commands.ActivateDeactivateSsoLink;
using Novologs.Domain.Entities;

namespace Novologs.Application.Tenant.Commands.DeleteTenantSsoLink;

public record DeleteTenantSsoLinkCommand : IRequest<Result<DeleteTenantSsoLinkResponse>>
{
    public Guid LinkId { get; set; }
    public LinkDirection LinkDirection { get; set; }
}

public class DeleteTenantSsoLinkResponse
{
}

public class DeleteTenantSsoLinkCommandValidator : AbstractValidator<DeleteTenantSsoLinkCommand>
{
    public DeleteTenantSsoLinkCommandValidator()
    {
        RuleFor(v => v.LinkId).NotEmpty();
    }
}

public class DeleteTenantSsoLinkCommandHandler : IRequestHandler<DeleteTenantSsoLinkCommand, Result<DeleteTenantSsoLinkResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public DeleteTenantSsoLinkCommandHandler(
        ITenantDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }


    public async Task<Result<DeleteTenantSsoLinkResponse>> Handle(DeleteTenantSsoLinkCommand request, CancellationToken cancellationToken)
    {
        if (request.LinkDirection == LinkDirection.To)
        {
            var link = await _context.GetSet<TenantUsersLinkedTo>()
                .FirstOrDefaultAsync(l => l.Id == request.LinkId && l.SourceUserId == _user.IdGuid, cancellationToken);
            if (link == null)
            {
                return Result<DeleteTenantSsoLinkResponse>.Failure("SsoLink.NotFound", "SSO link not found or you don't have permission to delete it.");
            }
            _context.GetSet<TenantUsersLinkedTo>().Remove(link);
        }
        else if (request.LinkDirection == LinkDirection.From)
        {
            var link = await _context.GetSet<TenantUsersLinkedFrom>()
                .FirstOrDefaultAsync(l => l.Id == request.LinkId && l.TargetUserId == _user.IdGuid, cancellationToken);
            if (link == null)
            {
                return Result<DeleteTenantSsoLinkResponse>.Failure("SsoLink.NotFound", "SSO link not found or you don't have permission to delete it.");
            }
            _context.GetSet<TenantUsersLinkedFrom>().Remove(link);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteTenantSsoLinkResponse>.Success(new DeleteTenantSsoLinkResponse());
    }
}
