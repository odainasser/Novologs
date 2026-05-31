using Novologs.Application.Modules.Chat.ChatMessages.Dto;
using Novologs.Application.Modules.Chat.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Chat.ChatMessages.Queries.GetChatMessage;

public record GetChatMessageQuery : IRequest<Result<GetChatMessageResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetChatMessageResponse : FilteredResult<ChatMessageDto>
{
}

public class ChatMessageDto
{
    public Guid Id { get; set; }
    public string? PayLoad { get; set; }
    public ChatUserDto? Sender { get; set; }

    public ChatMessageDeleteStatus DeletedStatus { get; set; }
    public Guid? ChatRoomId { get; set; }
    public List<ChatMessageRecieverDto> Recievers { get; set; } = new();
    public List<ReactionSummaryDto> Reactions { get; set; } = new();
    public List<ChatMentionDto> Mentions { get; set; } = new();
    public bool IsMentioned { get; set; }

    public AudioMessageDto? Audio { get; set; }
    public string MessageType => Audio != null ? "audio" : "text";

    public LinkedTaskDto? LinkedTask { get; set; }
    public bool IsTask { get; set; }

    public DateTime Created { get; set; }
    public DateTime? LastModified { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ChatMessage, ChatMessageDto>()
                .ForMember(dest => dest.Sender, opt => opt.MapFrom(src => src.Sender))
                .ForMember(dest => dest.Created, opt => opt.MapFrom(src => src.Created.DateTime))
                .ForMember(dest => dest.LastModified, opt => opt.MapFrom(src => src.LastModified.DateTime))
                .ForMember(dest => dest.Reactions, opt => opt.Ignore())
                .ForMember(dest => dest.Mentions, opt => opt.Ignore())
                .ForMember(dest => dest.IsMentioned, opt => opt.Ignore())
                ;
        }
    }
}

public class ChatUserDto
{
    public Guid Id { get; set; }
    public string? UserName { get; set; }
    public string? FullName { get; set; }
    public string? ProfileImageUrl { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TenantUser, ChatUserDto>()
                .ForMember(dest => dest.ProfileImageUrl,
                    opt => opt.MapFrom(src => src.ProfileImageFile != null ? src.ProfileImageFile.Url : null));
        }
    }
}

public class ChatMessageRecieverDto
{
    public ChatReciverMessageSeenStatus Status { get; set; }
    public ChatUserDto? Reciever { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ChatMessageReciever, ChatMessageRecieverDto>()
                .ForMember(dest => dest.Reciever, opt => opt.MapFrom(src => src.Reciever));
        }
    }
}

public class ChatMentionDto
{
    public ChatUserDto? User { get; set; }
}

public class ReactionSummaryDto
{
    public string Emoji { get; set; } = string.Empty;
    public int Count { get; set; }
    public bool CurrentUserReacted { get; set; }
    public List<ChatUserDto> Users { get; set; } = new();
}

public class LinkedTaskDto
{
    public Guid TaskId { get; set; }
    public string? TaskCode { get; set; }
    public long? TaskSerial { get; set; }
    public Guid StatusId { get; set; }
    public string? StatusName { get; set; }
    public string? StatusColor { get; set; }
}

public class GetChatMessageQueryValidator : AbstractValidator<GetChatMessageQuery>
{
    public GetChatMessageQueryValidator(
        IUser user
    )
    {
    }
}

public class GetChatMessageQueryHandler : IRequestHandler<GetChatMessageQuery, Result<GetChatMessageResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IMemoryCache _cache;
    private readonly IChatMessageCacheService _msgCache;


    public GetChatMessageQueryHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user,
        UserManager<TenantUser> userManager,
        IMemoryCache cache,
        IChatMessageCacheService msgCache
    )
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _userManager = userManager;
        _cache = cache;
        _msgCache = msgCache;
    }

    public async Task<Result<GetChatMessageResponse>> Handle(GetChatMessageQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetChatMessageResponse();

        //return only messages that the current user is sender or in the receiver list
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<GetChatMessageResponse>.Failure("ChatMessage_001", "User not found.");
        }

        // Extract ChatRoomId from search filters (used for caching + mark-as-seen)
        Guid? chatRoomId = ExtractChatRoomId(request);

        // Try to serve from cache when the query is room-scoped
        if (chatRoomId.HasValue && _user.Tenant != null)
        {
            var cacheKey = BuildMessageCacheKey(chatRoomId.Value, userId, request);
            var cached = await _cache.GetOrCreateAsync<GetChatMessageResponse>(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30);
                entry.AddExpirationToken(_msgCache.GetRoomChangeToken(_user.Tenant!, chatRoomId.Value));
                return await FetchMessagesFromDb(request, userId, cancellationToken);
            });

            result = cached ?? new GetChatMessageResponse();
        }
        else
        {
            result = await FetchMessagesFromDb(request, userId, cancellationToken);
        }

        // Mark messages as seen — always runs regardless of cache hit
        if (chatRoomId.HasValue)
        {
            await MarkMessagesAsSeenAsync(userId, chatRoomId.Value, cancellationToken);
        }

        return Result<GetChatMessageResponse>.Success(result);
    }

    private static Guid? ExtractChatRoomId(GetChatMessageQuery request)
    {
        if (request.Search == null) return null;

        if (request.Search.FieldName?.Equals("ChatRoomId", StringComparison.OrdinalIgnoreCase) == true
            && request.Search.FieldValue != null
            && Guid.TryParse(request.Search.FieldValue.ToString(), out var id1))
            return id1;

        if (request.Search.SubFilters?.Any() == true)
        {
            var f = request.Search.SubFilters.FirstOrDefault(sf =>
                sf.FieldName?.Equals("ChatRoomId", StringComparison.OrdinalIgnoreCase) == true);
            if (f?.FieldValue != null && Guid.TryParse(f.FieldValue.ToString(), out var id2))
                return id2;
        }

        return null;
    }

    private static string BuildMessageCacheKey(Guid roomId, Guid userId, GetChatMessageQuery request)
    {
        var page = request.Pagination?.PageNumber ?? 1;
        var size = request.Pagination?.PageSize ?? 20;
        var sort = request.Sort?.FieldName ?? "";
        var dir  = request.Sort?.SortDirection.ToString() ?? "";
        return $"msgs:{roomId}:{userId}:{sort}:{dir}:{page}:{size}";
    }

    private async Task<GetChatMessageResponse> FetchMessagesFromDb(
        GetChatMessageQuery request, Guid userId, CancellationToken cancellationToken)
    {
        var result = new GetChatMessageResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.ChatMessage>()
            .AsNoTracking().AsSplitQuery();

        //or if user has view all permission
        var hasViewAllPermission = await GetCachedPermission(userId, Novologs.Domain.Constants.Permissions.Chats.ViewAll);
        var hasGeneralViewAllPermission = await GetCachedPermission(userId, Novologs.Domain.Constants.Permissions.General.ViewAll);

        if (!hasViewAllPermission && !hasGeneralViewAllPermission)
        {
            query = query.Where(m => m.SenderId == userId || m.Recievers.Any(r => r.RecieverId == userId));
        }

        // Filter out messages deleted for all users
        query = query.Where(m => m.DeletedStatus != ChatMessageDeleteStatus.DeletedForAll);

        // Filter out messages the current user has deleted for themselves
        var userDeletedMessageIds = await _context.GetSet<Novologs.Domain.Entities.ChatMessageUserDeletion>()
            .Where(d => d.UserId == userId)
            .Select(d => d.ChatMessageId)
            .ToListAsync(cancellationToken);

        if (userDeletedMessageIds.Any())
        {
            query = query.Where(m => !userDeletedMessageIds.Contains(m.Id));
        }

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        // Default sort: newest messages first
        var sort = request.Sort ?? new SortFilter { FieldName = "Created", SortDirection = SortDirection.desc };
        query = query.ApplySorting(sort);

        // Enforce a default page size so we never load the entire message history
        var pagination = request.Pagination is { PageSize: > 0 }
            ? request.Pagination
            : new PaginationFilter { PageNumber = request.Pagination?.PageNumber ?? 1, PageSize = 20 };
        query = query.ApplyPagination(pagination);

        result.Items = await query
            .ProjectTo<ChatMessageDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        // Populate Audio data — single batch query instead of N+1 per-message queries
        if (result.Items.Any())
        {
            var allIds = result.Items.Select(m => m.Id).ToList();
            var audioData = await _context.GetSet<Novologs.Domain.Entities.ChatMessage>()
                .AsNoTracking()
                .Where(m => allIds.Contains(m.Id) && m.AudioFileId != null)
                .Select(m => new
                {
                    m.Id,
                    m.AudioFileId,
                    m.PayLoad,
                    AudioFileUrl = m.AudioFile != null ? m.AudioFile.Url : null
                })
                .ToListAsync(cancellationToken);

            var audioLookup = audioData.ToDictionary(m => m.Id);

            foreach (var message in result.Items)
            {
                if (!audioLookup.TryGetValue(message.Id, out var audio)) continue;

                var voiceData = ChatVoiceMessageData.FromJson(audio.PayLoad);
                var transcriptStr = voiceData?.TranscriptStr ?? audio.PayLoad;
                var audioUrl = audio.AudioFileUrl ?? voiceData?.AudioFileUrl;

                message.Audio = new AudioMessageDto
                {
                    AudioFileId = audio.AudioFileId!.Value,
                    AudioFileUrl = audioUrl,
                    IsTranscribed = ChatVoiceMessageData.IsTranscribed(audio.PayLoad),
                    Description = new AudioDescriptionDto
                    {
                        TranscriptStr = transcriptStr,
                        TranscriptLanguageStr = voiceData?.TranscriptLanguageStr,
                        TranscriptEnglishStr = voiceData?.TranscriptEnglishStr,
                        TranscriptArabicStr = voiceData?.TranscriptArabicStr
                    }
                };
                message.PayLoad = null;
            }
        }

        // Load reactions for all messages
        if (result.Items.Any())
        {
            var messageIds = result.Items.Select(m => m.Id).ToList();

            // Load linked tasks for all messages
            var chatMessageTasks = await _context.GetSet<Novologs.Domain.Entities.ChatMessageTask>()
                .AsNoTracking()
                .Include(cmt => cmt.Task)
                    .ThenInclude(t => t!.Status)
                        .ThenInclude(s => s!.Name)
                .Where(cmt => messageIds.Contains(cmt.ChatMessageId) && !cmt.IsDeleted)
                .ToListAsync(cancellationToken);

            foreach (var message in result.Items)
            {
                var chatMessageTask = chatMessageTasks.FirstOrDefault(cmt => cmt.ChatMessageId == message.Id);
                if (chatMessageTask != null)
                {
                    message.IsTask = true;
                    if (chatMessageTask.Task != null)
                    {
                        message.LinkedTask = new LinkedTaskDto
                        {
                            TaskId = chatMessageTask.TaskId,
                            TaskCode = chatMessageTask.Task.Code,
                            TaskSerial = chatMessageTask.Task.Serial,
                            StatusId = chatMessageTask.Task.StatusId,
                            StatusName = chatMessageTask.Task.Status?.Name?.Value,
                            StatusColor = chatMessageTask.Task.Status?.Color
                        };
                    }
                }
            }

            var reactions = await _context.GetSet<Novologs.Domain.Entities.ChatMessageReaction>()
                .Include(r => r.User)
                    .ThenInclude(u => u!.ProfileImageFile)
                .Where(r => messageIds.Contains(r.ChatMessageId) && r.IsDeleted == false)
                .ToListAsync(cancellationToken);

            // Group reactions by message and emoji
            foreach (var message in result.Items)
            {
                var messageReactions = reactions.Where(r => r.ChatMessageId == message.Id)
                    .GroupBy(r => r.Emoji)
                    .Select(g => new ReactionSummaryDto
                    {
                        Emoji = g.Key,
                        Count = g.Count(),
                        CurrentUserReacted = g.Any(r => r.UserId == userId),
                        Users = g.Select(r => _mapper.Map<ChatUserDto>(r.User)).ToList()
                    })
                    .ToList();

                message.Reactions = messageReactions;
            }

            // Load mentions for all messages
            var mentions = await _context.GetSet<Novologs.Domain.Entities.ChatMessageMention>()
                .AsNoTracking()
                .Include(m => m.User)
                    .ThenInclude(u => u!.ProfileImageFile)
                .Where(m => messageIds.Contains(m.ChatMessageId) && m.IsDeleted == false)
                .ToListAsync(cancellationToken);

            foreach (var message in result.Items)
            {
                var messageMentions = mentions
                    .Where(m => m.ChatMessageId == message.Id)
                    .Select(m => new ChatMentionDto { User = _mapper.Map<ChatUserDto>(m.User) })
                    .ToList();

                message.Mentions = messageMentions;
                message.IsMentioned = messageMentions.Any(m => m.User?.Id == userId);
            }
        }

        return result;
    }

    private async Task MarkMessagesAsSeenAsync(Guid userId, Guid roomId, CancellationToken cancellationToken)
    {
        try
        {
            var unreadReceivers = await _context.GetSet<Novologs.Domain.Entities.ChatMessageReciever>()
                .Include(r => r.ChatMessage)
                .Where(r => r.RecieverId == userId &&
                           r.ChatMessage!.ChatRoomId == roomId &&
                           r.Status != ChatReciverMessageSeenStatus.Seen)
                .ToListAsync(cancellationToken);

            if (unreadReceivers.Any())
            {
                foreach (var receiver in unreadReceivers)
                    receiver.Status = ChatReciverMessageSeenStatus.Seen;
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to mark messages as seen: {ex.Message}");
        }
    }

    private Task<bool> GetCachedPermission(Guid userId, string permission)
    {
        var key = $"{_user.Tenant}:perm:{userId}:{permission}";
        return _cache.GetOrCreateAsync(key, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(60);
            return _userManager.HasPermissionAsync(_context, userId, permission);
        })!;
    }
}
