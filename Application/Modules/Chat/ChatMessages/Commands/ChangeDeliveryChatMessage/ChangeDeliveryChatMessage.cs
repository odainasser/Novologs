using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Chat.ChatMessages.Commands.ChangeDeliveryChatMessage;

public record ChangeDeliveryChatMessageCommand : IRequest<Result<ChangeDeliveryChatMessageResponse>>
{
    public Guid UserId { get; set; }
    public Guid MessageId { get; set; }
    public Novologs.Domain.Enums.ChatReciverMessageSeenStatus Status { get; set; } =
        ChatReciverMessageSeenStatus.Delevered;
}

public class ChangeDeliveryChatMessageResponse
{
}

public class ChangeDeliveryChatMessageCommandValidator : AbstractValidator<ChangeDeliveryChatMessageCommand>
{
    public ChangeDeliveryChatMessageCommandValidator(ITenantDbContext context,
        IUser user)
    {
        RuleFor(v => v.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(v => v.MessageId)
            .NotEmpty().WithMessage("Message ID is required.");

        RuleFor(v => v.Status)
            .IsInEnum().WithMessage("Invalid status value.");

        RuleFor(v => v)
            .MustAsync(async (command, cancellationToken) =>
            {
                var messageReciever = await context.GetSet<Novologs.Domain.Entities.ChatMessageReciever>()
                    .AnyAsync(r => r.ChatMessageId == command.MessageId && r.RecieverId == command.UserId, cancellationToken);
                return messageReciever;
            }).WithMessage("The specified user is not a receiver of this message.");
        
        //delever status can change line NotDelevered to Delevered to Seen
        RuleFor(v => v)
            .MustAsync(async (command, cancellationToken) =>
            {
                var messageReciever = await context.GetSet<Novologs.Domain.Entities.ChatMessageReciever>()
                    .FirstOrDefaultAsync(r => r.ChatMessageId == command.MessageId && r.RecieverId == command.UserId, cancellationToken);

                if (messageReciever == null) return false;

                // Allow NotDelevered to Delevered or Seen
                if (messageReciever.Status == ChatReciverMessageSeenStatus.NotDelevered)
                {
                    return command.Status == ChatReciverMessageSeenStatus.Delevered || command.Status == ChatReciverMessageSeenStatus.Seen;
                }

                // Allow Delevered to Seen
                if (messageReciever.Status == ChatReciverMessageSeenStatus.Delevered)
                {
                    return command.Status == ChatReciverMessageSeenStatus.Seen;
                }

                // Seen status cannot be changed
                if (messageReciever.Status == ChatReciverMessageSeenStatus.Seen)
                {
                    return command.Status == ChatReciverMessageSeenStatus.Seen;
                }

                return false;
            }).WithMessage("Invalid status transition.");

    }
}

public class ChangeDeliveryChatMessageCommandHandler : IRequestHandler<ChangeDeliveryChatMessageCommand, Result<ChangeDeliveryChatMessageResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public ChangeDeliveryChatMessageCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user
        )
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<ChangeDeliveryChatMessageResponse>> Handle(ChangeDeliveryChatMessageCommand request, CancellationToken cancellationToken)
    {
        var messageReciever = await _context.GetSet<Novologs.Domain.Entities.ChatMessageReciever>()
            .FirstOrDefaultAsync(r => r.ChatMessageId == request.MessageId && r.RecieverId == request.UserId, cancellationToken);

        if (messageReciever == null)
        {
            return Result<ChangeDeliveryChatMessageResponse>.Failure("ChatMessageReciever_001", "Message receiver not found.");
        }

        messageReciever.Status = request.Status;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<ChangeDeliveryChatMessageResponse>.Success(new ChangeDeliveryChatMessageResponse());
    }
}
