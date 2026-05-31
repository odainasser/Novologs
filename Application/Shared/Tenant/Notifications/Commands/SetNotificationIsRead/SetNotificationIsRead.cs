using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Notifications.Commands.SetNotificationIsRead;

public record SetNotificationIsReadCommand : IRequest<Result<SetNotificationIsReadResponse>>
{
    public Guid Id { get; set; }
    public bool IsRead { get; set; }
}

public class SetNotificationIsReadResponse
{
}

public class SetNotificationIsReadCommandValidator : AbstractValidator<SetNotificationIsReadCommand>
{
    public SetNotificationIsReadCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Domain.Entities.Notification>()
                    .AnyAsync(n => n.Id == id && n.UserId == user.IdGuid, cancellationToken);
            }).WithMessage("Notification not found.");
    }
}

public class
    SetNotificationIsReadCommandHandler : IRequestHandler<SetNotificationIsReadCommand,
    Result<SetNotificationIsReadResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public SetNotificationIsReadCommandHandler(ITenantDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<Result<SetNotificationIsReadResponse>> Handle(SetNotificationIsReadCommand request,
        CancellationToken cancellationToken)
    {
        var notification = await _context.GetSet<Domain.Entities.Notification>()
            .FirstOrDefaultAsync(n => n.Id == request.Id && n.UserId == _user.IdGuid, cancellationToken);

        if (notification == null)
        {
            return Result<SetNotificationIsReadResponse>.Failure("Notification_001", "Notification not found.");
        }

        notification.IsRead = request.IsRead;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<SetNotificationIsReadResponse>.Success(new SetNotificationIsReadResponse());
    }
}
