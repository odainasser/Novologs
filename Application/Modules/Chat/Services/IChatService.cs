using Microsoft.Extensions.Primitives;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Chat.Services;

public interface IChatMessageCacheService
{
    /// <summary>Returns a change token that expires when the room's messages are invalidated.</summary>
    IChangeToken GetRoomChangeToken(string tenantId, Guid roomId);

    /// <summary>Cancels all in-flight cache entries for the given room.</summary>
    void InvalidateRoom(string tenantId, Guid roomId);
}

public interface IAiBotUserService
{
    /// <summary>Returns the bot TenantUser Id for the given tenant, creating it if it doesn't exist.</summary>
    Task<Guid> EnsureAiBotUserAsync(string tenantId, CancellationToken ct = default);
}

public interface IAiChatService
{
    /// <summary>
    /// Sends a prompt to the AI and returns the response text.
    /// conversationKey is used to scope conversation history (roomId for rooms, peerId for DMs).
    /// </summary>
    Task<string?> GetAiResponseAsync(
        string prompt,
        string userId,
        string tenantId,
        string conversationKey,
        string? bearerToken = null,
        CancellationToken ct = default);
}

public interface IChatService
{
    Task<List<Guid>> GetRoomMembers(Guid roomId);
    Task<bool> IsAiRoomAsync(Guid roomId);
    Task SaveMessageToRoom(Guid messageId, Guid senderId, string? messagePayLoad, Guid messageChatRoomId, Guid? audioFileId = null, List<Guid>? mentionedUserIds = null);

    Task SaveMessageToRecievers(Guid messageId, Guid senderId, string? messagePayLoad,
        List<Guid> messageRecieverIds, Guid? audioFileId = null, List<Guid>? mentionedUserIds = null);

    List<ChatUser> GetUsers(List<Guid> usersIds);
    Task<List<Guid>> ChangeDeliveryStatus(Guid messageMessageId, Guid messageReceiverId, ChatReciverMessageSeenStatus messageStatus);
    Task<Novologs.Domain.Entities.ChatMessage?> GetMessageById(Guid messageId);
}

public class ChatUser
{
    public Guid Id { get; set; }
    public string? UserName { get; set; }
    public string? FullName { get; set; }
    public string? ProfileImageUrl { get; set; }
    public LocalizableTextDto? DepartmentName { get; set; }
    public LocalizableTextDto? DesignationName { get; set; }
    public string? Country { get; set; }
    public string? UserType { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TenantUser, ChatUser>()
                .ForMember(dest => dest.ProfileImageUrl,
                    opt => opt.MapFrom(src => src.ProfileImageFile != null ? src.ProfileImageFile.Url : null))
                .ForMember(dest => dest.DepartmentName,
                    opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null))
                .ForMember(dest => dest.DesignationName,
                    opt => opt.MapFrom(src => src.Designation != null ? src.Designation.Name : null))
                .ForMember(dest => dest.UserType,
                    opt => opt.MapFrom(src => src.UserType.ToString()));
        }
    }
}
