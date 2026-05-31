using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Chat.ChatMessages.Commands.MarkRoomMessagesAsSeen;

public record MarkRoomMessagesAsSeenCommand : IRequest<Result<MarkRoomMessagesAsSeenResponse>>
{
    public Guid ChatRoomId { get; set; }
}

public class MarkRoomMessagesAsSeenResponse
{
    public int MessagesMarkedAsSeen { get; set; }
}

public class MarkRoomMessagesAsSeenCommandValidator : AbstractValidator<MarkRoomMessagesAsSeenCommand>
{
    public MarkRoomMessagesAsSeenCommandValidator(
        ITenantDbContext context,
        IUser user
    )
    {
        RuleFor(v => v.ChatRoomId)
            .NotEmpty().WithMessage("Chat Room ID is required.");

        // Verify user is a member of the chat room
        RuleFor(v => v)
            .MustAsync(async (command, cancellationToken) =>
            {
                if (!Guid.TryParse(user.Id, out var userId))
                    return false;

                var chatRoom = await context.GetSet<Novologs.Domain.Entities.ChatRoom>()
                    .FirstOrDefaultAsync(cr => cr.Id == command.ChatRoomId, cancellationToken);

                if (chatRoom == null)
                    return false;

                // Check if user is creator or member
                if (chatRoom.CreatorId == userId)
                    return true;

                var isMember = await context.GetSet<Novologs.Domain.Entities.ChatRoomMember>()
                    .AnyAsync(m => m.ChatRoomId == command.ChatRoomId && m.MemberId == userId, cancellationToken);

                return isMember;
            }).WithMessage("You are not a member of this chat room.");
    }
}

public class MarkRoomMessagesAsSeenCommandHandler : IRequestHandler<MarkRoomMessagesAsSeenCommand, Result<MarkRoomMessagesAsSeenResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public MarkRoomMessagesAsSeenCommandHandler(
        ITenantDbContext context,
        IUser user
    )
    {
        _context = context;
        _user = user;
    }

    public async Task<Result<MarkRoomMessagesAsSeenResponse>> Handle(MarkRoomMessagesAsSeenCommand request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<MarkRoomMessagesAsSeenResponse>.Failure("MarkRoomMessagesAsSeen_001", "Invalid user ID.");
        }

        // Get all unread messages for this user in this chat room
        var unreadReceivers = await _context.GetSet<Novologs.Domain.Entities.ChatMessageReciever>()
            .Include(r => r.ChatMessage)
            .Where(r => r.RecieverId == userId && 
                       r.ChatMessage!.ChatRoomId == request.ChatRoomId &&
                       r.Status != ChatReciverMessageSeenStatus.Seen)
            .ToListAsync(cancellationToken);

        // Mark all as seen
        foreach (var receiver in unreadReceivers)
        {
            receiver.Status = ChatReciverMessageSeenStatus.Seen;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<MarkRoomMessagesAsSeenResponse>.Success(new MarkRoomMessagesAsSeenResponse
        {
            MessagesMarkedAsSeen = unreadReceivers.Count
        });
    }
}
