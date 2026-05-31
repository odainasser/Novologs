using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Notifications.Commands.ClearNotification;

public record ClearNotificationCommand : IRequest<Result<ClearNotificationResponse>>
{
}

public class ClearNotificationResponse
{
}

public class ClearNotificationCommandValidator : AbstractValidator<ClearNotificationCommand>
{
    public ClearNotificationCommandValidator(ITenantDbContext context, IUser user)
    {
    }
}

public class
    ClearNotificationCommandHandler : IRequestHandler<ClearNotificationCommand, Result<ClearNotificationResponse>>
{
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly ITenantDbContext _context;

    public ClearNotificationCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<ClearNotificationResponse>> Handle(ClearNotificationCommand request,
        CancellationToken cancellationToken)
    {
        var notifications = await _context.GetSet<Domain.Entities.Notification>()
            .Where(n => n.UserId == _user.IdGuid)
            .ToListAsync(cancellationToken);

        _context.GetSet<Domain.Entities.Notification>().RemoveRange(notifications);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<ClearNotificationResponse>.Success(new ClearNotificationResponse());
    }
}
