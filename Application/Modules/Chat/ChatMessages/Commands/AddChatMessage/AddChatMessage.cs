using Novologs.Application.Modules.Chat.ChatMessages.Dto;
using Novologs.Application.Modules.Chat.Services;
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.Extensions.Logging;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Chat.ChatMessages.Commands.AddChatMessage;

public record AddChatMessageCommand : IRequest<Result<AddChatMessageResponse>>
{
    public string? PayLoad { get; set; }
    public Guid? ChatRoomId { get; set; }
    public List<Guid>? RecieverIds { get; set; }
    public Guid? AudioFileId { get; set; }
    public bool AutoTranscribe { get; set; } = false;
    public List<Guid>? MentionedUserIds { get; set; }
    public List<Guid>? MentionedUsersIds { get; set; }

    public List<Guid> GetNormalizedMentionedUserIds()
    {
        return (MentionedUserIds ?? [])
            .Concat(MentionedUsersIds ?? [])
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();
    }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddChatMessageCommand, Novologs.Domain.Entities.ChatMessage>()
                .ForMember(dest => dest.Recievers, opt => opt.Ignore())
                .ForMember(dest => dest.Mentions, opt => opt.Ignore())
                .ForMember(dest => dest.PayLoad, opt => opt.Ignore());
        }
    }
}

public class AddChatMessageResponse
{
    public Guid Id { get; set; }
}

public class AddChatMessageCommandValidator : AbstractValidator<AddChatMessageCommand>
{
    public AddChatMessageCommandValidator(ITenantDbContext context,
        IUser user)
    {
        RuleFor(v => v.ChatRoomId)
            .MustAsync(async (chatRoomId, cancellationToken) =>
            {
                if (chatRoomId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.ChatRoom>()
                    .AnyAsync(cr => cr.Id == chatRoomId, cancellationToken);
            }).WithMessage("Chat room not found.");

        RuleFor(v => v.RecieverIds)
            .MustAsync(async (recieverIds, cancellationToken) =>
            {
                if (recieverIds == null || recieverIds.Count == 0) return true;
                var distinctRecieverIds = recieverIds.Distinct().ToList();
                var existingUsersCount = await context.GetSet<Novologs.Domain.Entities.TenantUser>()
                    .CountAsync(u => distinctRecieverIds.Contains(u.Id), cancellationToken);
                return existingUsersCount == distinctRecieverIds.Count;
            }).WithMessage("One or more reciever IDs are invalid.");

        RuleFor(v => new { v.ChatRoomId, v.RecieverIds })
            .Must(x => x.ChatRoomId != null || (x.RecieverIds != null && x.RecieverIds.Count > 0))
            .WithMessage("Either a chat room or at least one reciever must be specified.");

        RuleFor(v => new { v.ChatRoomId, v.RecieverIds })
            .Must(x => !(x.ChatRoomId != null && (x.RecieverIds != null && x.RecieverIds.Count > 0)))
            .WithMessage("Cannot specify both a chat room and recievers.");

        // Validate either PayLoad (text) OR AudioFileId (audio), not both
        RuleFor(v => new { v.PayLoad, v.AudioFileId })
            .Must(x => !string.IsNullOrWhiteSpace(x.PayLoad) || x.AudioFileId != null)
            .WithMessage("Either PayLoad (text message) or AudioFileId (audio message) must be provided.");

        RuleFor(v => new { v.PayLoad, v.AudioFileId })
            .Must(x => string.IsNullOrWhiteSpace(x.PayLoad) || x.AudioFileId == null)
            .WithMessage("Cannot specify both PayLoad and AudioFileId.");

        // Validate AudioFileId exists if provided
        RuleFor(v => v.AudioFileId)
            .MustAsync(async (audioFileId, cancellationToken) =>
            {
                if (audioFileId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .AnyAsync(f => f.Id == audioFileId && f.IsFile, cancellationToken);
            }).WithMessage("Audio file not found.");

        // AutoTranscribe requires AudioFileId
        RuleFor(v => new { v.AutoTranscribe, v.AudioFileId })
            .Must(x => !x.AutoTranscribe || x.AudioFileId != null)
            .WithMessage("AutoTranscribe can only be true when AudioFileId is provided.");

        // Validate MentionedUserIds if provided
        RuleFor(v => v)
            .MustAsync(async (command, cancellationToken) =>
            {
                var normalizedMentionedUserIds = command.GetNormalizedMentionedUserIds();
                if (normalizedMentionedUserIds.Count == 0) return true;

                var existingCount = await context.GetSet<Novologs.Domain.Entities.TenantUser>()
                    .CountAsync(u => normalizedMentionedUserIds.Contains(u.Id), cancellationToken);
                return existingCount == normalizedMentionedUserIds.Count;
            }).WithMessage("One or more mentioned user IDs are invalid.");
    }
}

public class AddChatMessageCommandHandler : IRequestHandler<AddChatMessageCommand, Result<AddChatMessageResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly IChatVoiceProcessingService _voiceProcessingService;
    private readonly SendEmailAndNotificationService _notificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;
    private readonly ILogger<AddChatMessageCommandHandler> _logger;
    private readonly IChatMessageCacheService _msgCache;

    public AddChatMessageCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user,
        IChatVoiceProcessingService voiceProcessingService,
        SendEmailAndNotificationService notificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor,
        ILogger<AddChatMessageCommandHandler> logger,
        IChatMessageCacheService msgCache)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _voiceProcessingService = voiceProcessingService;
        _notificationService = notificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
        _logger = logger;
        _msgCache = msgCache;
    }

    public async Task<Result<AddChatMessageResponse>> Handle(AddChatMessageCommand request,
        CancellationToken cancellationToken)
    {
        var chatMessage = _mapper.Map<Novologs.Domain.Entities.ChatMessage>(request);

        if (!Guid.TryParse(_user.Id, out var senderId))
        {
            return Result<AddChatMessageResponse>.Failure("ChatMessage_001", "Sender not found.");
        }
        chatMessage.SenderId = senderId;

        // Handle audio message with optional auto-transcription
        if (request.AudioFileId != null)
        {
            chatMessage.AudioFileId = request.AudioFileId;

            if (request.AutoTranscribe)
            {
                try
                {
                    var transcriptData = await _voiceProcessingService.TranscribeAudioAsync(request.AudioFileId.Value);
                    chatMessage.PayLoad = transcriptData.ToJson();
                }
                catch (Exception ex)
                {
                    // Log the error but continue - message will be sent without transcript
                    Console.WriteLine($"Transcription failed: {ex.Message}");
                    chatMessage.PayLoad = null;
                }
            }
            else
            {
                // Instant send - no transcript yet
                chatMessage.PayLoad = null;
            }
        }
        else
        {
            // Text message
            chatMessage.PayLoad = request.PayLoad;
        }

        var participantIds = new HashSet<Guid>();

        if (request.ChatRoomId != null)
        {
            var chatRoom = await _context.GetSet<Novologs.Domain.Entities.ChatRoom>()
                .Include(cr => cr.Members)
                .FirstOrDefaultAsync(cr => cr.Id == request.ChatRoomId, cancellationToken);

            if (chatRoom == null)
            {
                return Result<AddChatMessageResponse>.Failure("ChatMessage_002", "Chat room not found.");
            }

            chatMessage.ChatRoomId = chatRoom.Id;
            foreach (var member in chatRoom.Members)
            {
                if (member.MemberId != senderId)
                {
                    chatMessage.Recievers.Add(new Novologs.Domain.Entities.ChatMessageReciever
                    {
                        RecieverId = member.MemberId, ChatMessageId = chatMessage.Id
                    });
                }
                participantIds.Add(member.MemberId);
            }
        }

        if (request.RecieverIds != null && request.RecieverIds.Count > 0)
        {
            participantIds.Add(senderId); // sender is a participant in direct chat, same as chat room members
            foreach (var recieverId in request.RecieverIds.Distinct())
            {
                if (recieverId != senderId)
                {
                    chatMessage.Recievers.Add(new Novologs.Domain.Entities.ChatMessageReciever
                    {
                        RecieverId = recieverId, ChatMessageId = chatMessage.Id
                    });
                }
                participantIds.Add(recieverId);
            }
        }

        // Add mentions atomically with the message — same single SaveChangesAsync
        var requestedMentionIds = request.GetNormalizedMentionedUserIds();
        var validMentionIds = new List<Guid>();
        if (requestedMentionIds.Count > 0)
        {
            _logger.LogDebug("[AddChatMessage] Mention processing started. ChatMessageId={ChatMessageId}, SenderId={SenderId}, RequestedMentionIds=[{MentionIds}], ParticipantIds=[{ParticipantIds}]",
                chatMessage.Id, senderId,
                string.Join(",", requestedMentionIds),
                string.Join(",", participantIds));

            var droppedByParticipantFilter = requestedMentionIds
                .Where(id => !participantIds.Contains(id))
                .ToList();

            var droppedBySenderFilter = requestedMentionIds
                .Where(id => participantIds.Contains(id) && id == senderId)
                .ToList();

            if (droppedByParticipantFilter.Count > 0)
                _logger.LogWarning("[AddChatMessage] Mention(s) dropped — user(s) not in participant list: [{Dropped}]. ParticipantIds=[{ParticipantIds}]",
                    string.Join(",", droppedByParticipantFilter),
                    string.Join(",", participantIds));

            if (droppedBySenderFilter.Count > 0)
                _logger.LogWarning("[AddChatMessage] Mention(s) dropped — sender cannot mention themselves: [{Dropped}]",
                    string.Join(",", droppedBySenderFilter));

            validMentionIds = requestedMentionIds
                .Where(id => participantIds.Contains(id) && id != senderId)
                .ToList();

            _logger.LogDebug("[AddChatMessage] ValidMentionIds after filtering: [{ValidMentionIds}]",
                string.Join(",", validMentionIds));

            foreach (var mentionedUserId in validMentionIds)
            {
                var mention = new Novologs.Domain.Entities.ChatMessageMention(Guid.NewGuid())
                {
                    UserId = mentionedUserId,
                    ChatMessage = chatMessage
                };
                chatMessage.Mentions.Add(mention);
                _logger.LogDebug("[AddChatMessage] Mention entity added. MentionId={MentionId}, UserId={UserId}",
                    mention.Id, mentionedUserId);
            }
        }
        else
        {
            _logger.LogDebug("[AddChatMessage] No MentionedUserIds provided. Skipping mention processing.");
        }

        _logger.LogDebug("[AddChatMessage] Saving ChatMessage. Id={ChatMessageId}, MentionCount={MentionCount}, ReceiverCount={ReceiverCount}",
            chatMessage.Id, chatMessage.Mentions.Count, chatMessage.Recievers.Count);

        await _context.GetSet<Novologs.Domain.Entities.ChatMessage>().AddAsync(chatMessage, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Invalidate cached message list for this room so all members see the new message
        if (chatMessage.ChatRoomId.HasValue && _user.Tenant != null)
        {
            _msgCache.InvalidateRoom(_user.Tenant, chatMessage.ChatRoomId.Value);
        }

        _logger.LogInformation("[AddChatMessage] ChatMessage saved successfully. Id={ChatMessageId}, MentionCount={MentionCount}",
            chatMessage.Id, chatMessage.Mentions.Count);

        // Send mention notifications after successful save
        if (validMentionIds.Count > 0)
        {
            var sender = await _context.GetSet<Novologs.Domain.Entities.TenantUser>()
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == senderId, cancellationToken);
            var senderName = sender?.FullName ?? sender?.UserName ?? "Someone";

            var tenantId = _multiTenantContextAccessor.MultiTenantContext?.TenantInfo?.Id;
            _notificationService.SendNotification(new NotificationData
            {
                TenantId = tenantId,
                UserIds = validMentionIds,
                Type = NotificationType.MentionedInChat,
                Title = "You were mentioned",
                Body = $"You are mentioned by {senderName}",
                Data = new Dictionary<string, string>
                {
                    { "MessageId", chatMessage.Id.ToString() },
                    { "SenderId", senderId.ToString() },
                    { "ChatRoomId", chatMessage.ChatRoomId?.ToString() ?? "" }
                }
            });
        }

        return Result<AddChatMessageResponse>.Success(new AddChatMessageResponse { Id = chatMessage.Id });
    }
}
