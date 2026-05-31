using AutoMapper;
using AutoMapper.QueryableExtensions;
using Novologs.Application.Modules.Chat.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using SystemLoaders.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Infrastructure.Services;

public class ChatService : IChatService
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<ChatService> _logger;
    private readonly IMemoryCache _cache;

    public ChatService(
        ITenantDbContext context,
        IMapper mapper,
        ILogger<ChatService> logger,
        IMemoryCache cache
    )
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
        _cache = cache;
    }

    public Task<List<Guid>> GetRoomMembers(Guid roomId)
    {
        var key = $"room:members:{roomId}";
        return _cache.GetOrCreateAsync(key, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(60);
            return _context.GetSet<ChatRoomMember>()
                .AsNoTracking()
                .Where(m => m.ChatRoomId == roomId)
                .Select(m => m.MemberId)
                .ToListAsync();
        })!;
    }

    public Task<bool> IsAiRoomAsync(Guid roomId)
    {
        var key = $"room:isai:{roomId}";
        return _cache.GetOrCreateAsync(key, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30);
            return _context.GetSet<ChatRoom>()
                .AsNoTracking()
                .Where(r => r.Id == roomId)
                .Select(r => r.IsAiRoom)
                .FirstOrDefaultAsync();
        })!;
    }

    public async Task SaveMessageToRoom(Guid messageId, Guid senderId, string? messagePayLoad,
        Guid messageChatRoomId, Guid? audioFileId = null, List<Guid>? mentionedUserIds = null)
    {
        // Query ChatRoomMember directly — same query used by GetRoomMembers (for the broadcast).
        // Avoids a ChatRoom Include that silently skips the entire save when ChatRoom.IsDeleted=true
        // while its member rows are still active.
        var memberIds = await _context.GetSet<ChatRoomMember>()
            .AsNoTracking()
            .Where(m => m.ChatRoomId == messageChatRoomId)
            .Select(m => m.MemberId)
            .ToListAsync();

        if (memberIds.Count == 0)
        {
            _logger.LogWarning("SaveMessageToRoom: no members found for ChatRoomId={ChatRoomId}. Message {MessageId} not saved.", messageChatRoomId, messageId);
            return;
        }

        var message = new Novologs.Domain.Entities.ChatMessage()
        {
            Id = messageId, SenderId = senderId, PayLoad = messagePayLoad, ChatRoomId = messageChatRoomId,
            AudioFileId = audioFileId
        };

        var participantIds = memberIds.ToHashSet();

        foreach (var memberId in memberIds)
        {
            // Don't add the sender as a receiver of their own message
            if (memberId != senderId)
            {
                message.Recievers.Add(new() { RecieverId = memberId });
            }
        }

        var normalizedMentionedUserIds = (mentionedUserIds ?? [])
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();

        if (normalizedMentionedUserIds.Count > 0)
        {
            _logger.LogInformation("Processing {Count} mentions in Room {RoomId} from Sender {SenderId}", normalizedMentionedUserIds.Count, messageChatRoomId, senderId);
            _logger.LogInformation("Participants in Room {RoomId}: {ParticipantIds}", messageChatRoomId, string.Join(", ", participantIds));

            foreach (var mentionedUserId in normalizedMentionedUserIds)
            {
                if (participantIds.Contains(mentionedUserId) && mentionedUserId != senderId)
                {
                    var mention = new ChatMessageMention(Guid.NewGuid())
                    {
                        UserId = mentionedUserId,
                        ChatMessageId = messageId,
                        ChatMessage = message
                    };
                    message.Mentions.Add(mention);
                    _logger.LogInformation("Mention added for user {UserId} in message {MessageId}", mentionedUserId, message.Id);
                }
                else
                {
                    _logger.LogWarning("Mention skipped for user {UserId}. IsParticipant={IsParticipant}, IsSender={IsSender}",
                        mentionedUserId, participantIds.Contains(mentionedUserId), mentionedUserId == senderId);
                }
            }
        }
        else
        {
            _logger.LogInformation("No mentioned users provided for Room message {MessageId}.", messageId);
        }

        _context.GetSet<ChatMessage>().Add(message);
        await _context.SaveChangesAsync();
    }

    public async Task SaveMessageToRecievers(Guid messageId, Guid senderId, string? messagePayLoad,
        List<Guid> messageRecieverIds, Guid? audioFileId = null, List<Guid>? mentionedUserIds = null)
    {
        if (messageRecieverIds.Any())
        {
            var chatReciever = await _context.GetSet<TenantUser>()
                .Where(c => messageRecieverIds.Any(id => id == c.Id))
                .AsNoTracking()
                .ToListAsync();

            var message = new ChatMessage()
            {
                Id = messageId, SenderId = senderId, PayLoad = messagePayLoad, Recievers = new(),
                AudioFileId = audioFileId
            };
            foreach (var reciver in chatReciever)
            {
                // Don't add the sender as a receiver of their own message
                if (reciver.Id != senderId)
                {
                    message.Recievers.Add(new() { RecieverId = reciver.Id });
                }
            }

            var normalizedMentionedUserIds = (mentionedUserIds ?? [])
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToList();

            if (normalizedMentionedUserIds.Count > 0)
            {
                _logger.LogInformation("Processing {Count} mentions in DM from Sender {SenderId}", normalizedMentionedUserIds.Count, senderId);
                var participantIds = messageRecieverIds.ToHashSet();
                participantIds.Add(senderId);
                _logger.LogInformation("Participants in DM: {ParticipantIds}", string.Join(", ", participantIds));

                foreach (var mentionedUserId in normalizedMentionedUserIds)
                {
                    if (participantIds.Contains(mentionedUserId) && mentionedUserId != senderId)
                    {
                        var mention = new ChatMessageMention(Guid.NewGuid())
                        {
                            UserId = mentionedUserId,
                            ChatMessageId = messageId,
                            ChatMessage = message
                        };
                        message.Mentions.Add(mention);
                        _logger.LogInformation("Mention added for user {UserId} in DM message {MessageId}", mentionedUserId, message.Id);
                    }
                    else
                    {
                        _logger.LogWarning("Mention skipped for user {UserId} in DM. IsParticipant={IsParticipant}, IsSender={IsSender}",
                            mentionedUserId, participantIds.Contains(mentionedUserId), mentionedUserId == senderId);
                    }
                }
            }
            else
            {
                _logger.LogInformation("No mentioned users provided for DM message {MessageId}.", messageId);
            }

            _context.GetSet<ChatMessage>().Add(message);
            await _context.SaveChangesAsync();
        }
    }

    public List<ChatUser> GetUsers(List<Guid> usersGuids)
    {
        var users = _context.GetSet<TenantUser>()
            .Where(u => usersGuids.Contains(u.Id))
            .Include(u => u.ProfileImageFile)
            .Include(u => u.Department)
            .Include(u => u.Designation)
            .ProjectTo<ChatUser>(_mapper.ConfigurationProvider)
            .ToList();

        return users;
    }

    public async Task<List<Guid>> ChangeDeliveryStatus(Guid messageMessageId, Guid messageReceiverId,
        ChatReciverMessageSeenStatus messageStatus)
    {
        var message = await _context.GetSet<ChatMessage>()
            .Include(m => m.Recievers)
            .FirstOrDefaultAsync(m => m.Id == messageMessageId);

        if (message == null)
        {
            return new List<Guid>();
        }

        var reciever = message.Recievers.FirstOrDefault(r => r.RecieverId == messageReceiverId);

        if (reciever == null)
        {
            return new List<Guid>();
        }

        reciever.Status = messageStatus;
        
        //if new status is seen then update the notification IsRead to true
        if (messageStatus == ChatReciverMessageSeenStatus.Seen)
        {
            // Fetch notifications in memory and filter on the Data dictionary
            var messageIdString = messageMessageId.ToString();
            var notifications = await _context.GetSet<Notification>()
                .Where(n =>
                    n.Type == NotificationType.ChatMessage &&
                    n.Data != null &&
                    n.UserId == messageReceiverId)
                .ToListAsync();

            var notification = notifications.FirstOrDefault(n => 
                n.Data != null &&
                n.Data.ContainsKey("MessageId") && 
                n.Data["MessageId"] == messageIdString);

            if (notification != null)
            {
                notification.IsRead = true;
            }
        }


        await _context.SaveChangesAsync();

        // Notify the sender and all receivers in the conversation
        var notifyUsers = new List<Guid> { message.SenderId };
        
        // Add the receiver who marked it as read (for multi-device sync)
        if (!notifyUsers.Contains(messageReceiverId))
        {
            notifyUsers.Add(messageReceiverId);
        }
        
        // Add all other receivers so they see the updated read status
        foreach (var receiver in message.Recievers)
        {
            if (!notifyUsers.Contains(receiver.RecieverId))
            {
                notifyUsers.Add(receiver.RecieverId);
            }
        }

        return notifyUsers;
    }

    public async Task<ChatMessage?> GetMessageById(Guid messageId)
    {
        var message = await _context.GetSet<ChatMessage>()
            .Include(m => m.Recievers)
            .Include(m => m.ChatRoom)
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == messageId);

        return message;
    }
}
