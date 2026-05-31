using Novologs.Application.Modules.Chat.ChatMessages.Queries.GetChatMessage;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Chat.ChatRooms.Queries.GetChatRoom;

public record GetChatRoomQuery : IRequest<Result<GetChatRoomResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }

    public bool MyRooms { get; set; } = false;
}

public class GetChatRoomResponse : FilteredResult<ChatRoomDto>
{
    public int TotalUnreadMessages { get; set; }
}

public class ChatRoomDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Code { get; set; }
    public long Serial { get; set; }

    public ChatUserDto? Creator { get; set; }
    public List<ChatRoomMemberDto> Members { get; set; } = new();

    public int TotalMessages { get; set; }

    public int TotalUnreadMessages { get; set; }

    public ChatMessageDto? LastMessage { get; set; }

    public DateTime Created { get; set; }
    public DateTime? LastModified { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ChatRoom, ChatRoomDto>()
                .ForMember(dest => dest.Creator, opt => opt.MapFrom(src => src.Creator))
                .ForMember(dest => dest.Members, opt => opt.MapFrom(src => src.Members))
                .ForMember(dest => dest.TotalMessages, opt => opt.Ignore())
                .ForMember(dest => dest.LastMessage, opt => opt.Ignore())
                .ForMember(dest => dest.Created, opt => opt.MapFrom(src => src.Created.DateTime))
                .ForMember(dest => dest.LastModified, opt => opt.MapFrom(src => src.LastModified.DateTime))
                ;
        }
    }
}

public class ChatRoomMemberDto
{
    public Guid Id { get; set; }
    public ChatRoomMemberRole Role { get; set; }
    public ChatUserDto? Member { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ChatRoomMember, ChatRoomMemberDto>()
                .ForMember(dest => dest.Member, opt => opt.MapFrom(src => src.Member));
        }
    }
}

public class GetChatRoomQueryValidator : AbstractValidator<GetChatRoomQuery>
{
    public GetChatRoomQueryValidator(
        IUser user
    )
    {
    }
}

public class GetChatRoomQueryHandler : IRequestHandler<GetChatRoomQuery, Result<GetChatRoomResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IMemoryCache _cache;

    public GetChatRoomQueryHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user,
        UserManager<TenantUser> userManager,
        IMemoryCache cache)
    {
        _userManager = userManager;
        _context = context;
        _mapper = mapper;
        _user = user;
        _cache = cache;
    }

    public async Task<Result<GetChatRoomResponse>> Handle(GetChatRoomQuery request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<GetChatRoomResponse>.Failure("ChatRoom_001", "User not found.");
        }

        var result = new GetChatRoomResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.ChatRoom>()
            .AsNoTracking().AsSplitQuery();

        //filter myrooms
        if (request.MyRooms)
        {
            query = query.Where(cr => cr.Members.Any(m => cr.CreatorId == userId || m.MemberId == userId));
        }
        else
        {
            var hasViewAllPermission = await GetCachedPermission(userId, Novologs.Domain.Constants.Permissions.Chats.ViewAll);
            var hasGeneralViewAllPermission = await GetCachedPermission(userId, Novologs.Domain.Constants.Permissions.General.ViewAll);

            if (!hasViewAllPermission && !hasGeneralViewAllPermission)
            {
                query = query.Where(cr => cr.CreatorId == userId || cr.Members.Any(m => m.MemberId == userId));
            }
        }

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);
        result.Items = await query.ProjectTo<ChatRoomDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        // Get message counts and last messages for each room efficiently
        var roomIds = result.Items.Select(r => r.Id).ToList();
        if (roomIds.Any())
        {
            // Get messages deleted by current user
            var userDeletedMessageIds = await _context.GetSet<Novologs.Domain.Entities.ChatMessageUserDeletion>()
                .Where(d => d.UserId == _user.IdGuid)
                .Select(d => d.ChatMessageId)
                .ToListAsync(cancellationToken);

            // Get message counts per room
            var messageCounts = await _context.GetSet<Novologs.Domain.Entities.ChatMessage>()
                .Where(m => roomIds.Contains(m.ChatRoomId!.Value) && 
                           m.DeletedStatus == ChatMessageDeleteStatus.NotDeleted &&
                           !userDeletedMessageIds.Contains(m.Id))
                .GroupBy(m => m.ChatRoomId)
                .Select(g => new { RoomId = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            // Get last message IDs for each room using subquery
            var lastMessageIds = await _context.GetSet<Novologs.Domain.Entities.ChatMessage>()
                .Where(m => roomIds.Contains(m.ChatRoomId!.Value) && 
                           m.DeletedStatus == ChatMessageDeleteStatus.NotDeleted &&
                           !userDeletedMessageIds.Contains(m.Id))
                .GroupBy(m => m.ChatRoomId)
                .Select(g => new 
                { 
                    RoomId = g.Key, 
                    LastMessageId = g.OrderByDescending(m => m.Created).Select(m => m.Id).FirstOrDefault()
                })
                .Where(x => x.LastMessageId != Guid.Empty)
                .ToListAsync(cancellationToken);

            // Get the actual last messages
            var messageIdsToFetch = lastMessageIds.Select(x => x.LastMessageId).ToList();
            var lastMessages = messageIdsToFetch.Any() 
                ? await _context.GetSet<Novologs.Domain.Entities.ChatMessage>()
                    .Where(m => messageIdsToFetch.Contains(m.Id))
                    .ProjectTo<ChatMessageDto>(_mapper.ConfigurationProvider)
                    .ToListAsync(cancellationToken)
                : new List<ChatMessageDto>();

            // Populate the counts and last messages
            foreach (var item in result.Items)
            {
                item.TotalMessages = messageCounts.FirstOrDefault(mc => mc.RoomId == item.Id)?.Count ?? 0;
                
                var lastMsgId = lastMessageIds.FirstOrDefault(lm => lm.RoomId == item.Id)?.LastMessageId;
                if (lastMsgId.HasValue && lastMsgId.Value != Guid.Empty)
                {
                    item.LastMessage = lastMessages.FirstOrDefault(lm => lm.Id == lastMsgId.Value);
                }
            }
        }

        var UnreadMessages = await _context.GetSet<Novologs.Domain.Entities.ChatMessageReciever>()
            .Include(chr => chr.ChatMessage)
            .Where(r => r.ChatMessage!.SenderId != _user.IdGuid && r.RecieverId == _user.IdGuid &&
                        r.Status != ChatReciverMessageSeenStatus.Seen)
            .ToListAsync(cancellationToken);
        result.TotalUnreadMessages = UnreadMessages.Count();
        foreach (var item in result.Items)
        {
            item.TotalUnreadMessages = UnreadMessages.Count(r => r.ChatMessage?.ChatRoomId == item.Id);
        }

        return Result<GetChatRoomResponse>.Success(result);
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
