using Novologs.Application.Modules.Chat.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Chat.ChatMessages.Commands.DeleteChatMessage;

public record DeleteChatMessageCommand : IRequest<Result<DeleteChatMessageResponse>>
{
    public ChatMessageDeleteStatus DeletedStatus { get; set; } = ChatMessageDeleteStatus.NotDeleted;
    public Guid Id { get; set; }
}

public class DeleteChatMessageResponse
{
}

public class DeleteChatMessageCommandValidator : AbstractValidator<DeleteChatMessageCommand>
{
    public DeleteChatMessageCommandValidator(
        ITenantDbContext context,
        IUser user)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.ChatMessage>()
                    .AnyAsync(m => m.Id == id, cancellationToken);
            }).WithMessage("Chat message not found.");

        RuleFor(v => v)
            .MustAsync(async (command, cancellationToken) =>
            {
                if (!Guid.TryParse(user.Id, out var userId))
                {
                    return false;
                }

                // DeletedForMe (1) - anyone can hide message for themselves
                if (command.DeletedStatus == ChatMessageDeleteStatus.DeletedForMe)
                {
                    return true;
                }

                // DeletedForAll (2) - only sender can delete for everyone
                return await context.GetSet<Novologs.Domain.Entities.ChatMessage>()
                    .AnyAsync(m => m.Id == command.Id && m.SenderId == userId, cancellationToken);
            }).WithMessage("Only the sender can delete a message for all users.");
    }
}

public class
    DeleteChatMessageCommandHandler : IRequestHandler<DeleteChatMessageCommand, Result<DeleteChatMessageResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IChatMessageCacheService _msgCache;

    public DeleteChatMessageCommandHandler(ITenantDbContext context,
        IUser user,
        IChatMessageCacheService msgCache)
    {
        _context = context;
        _user = user;
        _msgCache = msgCache;
    }

    public async Task<Result<DeleteChatMessageResponse>> Handle(DeleteChatMessageCommand request,
        CancellationToken cancellationToken)
    { 
        var chatMessage = await _context.GetSet<Novologs.Domain.Entities.ChatMessage>()
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (chatMessage == null)
        {
            return Result<DeleteChatMessageResponse>.Failure("ChatMessage_001", "Chat message not found.");
        }

        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<DeleteChatMessageResponse>.Failure("ChatMessage_002", "Invalid user.");
        }

        // DeletedForMe: Track per-user deletion
        if (request.DeletedStatus == ChatMessageDeleteStatus.DeletedForMe)
        {
            // Check if already deleted by this user
            var existingDeletion = await _context.GetSet<Novologs.Domain.Entities.ChatMessageUserDeletion>()
                .FirstOrDefaultAsync(d => d.ChatMessageId == request.Id && d.UserId == userId, cancellationToken);

            if (existingDeletion == null)
            {
                var userDeletion = new Novologs.Domain.Entities.ChatMessageUserDeletion
                {
                    ChatMessageId = request.Id,
                    UserId = userId
                };
                _context.GetSet<Novologs.Domain.Entities.ChatMessageUserDeletion>().Add(userDeletion);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
        // DeletedForAll: Sender deletes message for everyone
        else if (request.DeletedStatus == ChatMessageDeleteStatus.DeletedForAll)
        {
            chatMessage.DeletedStatus = ChatMessageDeleteStatus.DeletedForAll;
            chatMessage.PayLoad = null; // Remove message content for everyone
            await _context.SaveChangesAsync(cancellationToken);
        }

        if (chatMessage.ChatRoomId.HasValue && _user.Tenant != null)
        {
            _msgCache.InvalidateRoom(_user.Tenant, chatMessage.ChatRoomId.Value);
        }

        return Result<DeleteChatMessageResponse>.Success(new DeleteChatMessageResponse());
    }
}
