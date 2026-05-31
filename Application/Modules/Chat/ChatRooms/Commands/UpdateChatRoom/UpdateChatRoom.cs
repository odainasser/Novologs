using Microsoft.Extensions.Caching.Memory;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Chat.ChatRooms.Commands.UpdateChatRoom;

public record UpdateChatRoomCommand : IRequest<Result<UpdateChatRoomResponse>>
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public List<Guid>? MemberIds { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateChatRoomCommand, Novologs.Domain.Entities.ChatRoom>()
                .ForMember(dest => dest.Members, opt => opt.Ignore());
        }
    }
}

public class UpdateChatRoomResponse
{
}

public class UpdateChatRoomCommandValidator : AbstractValidator<UpdateChatRoomCommand>
{
    public UpdateChatRoomCommandValidator(
        ITenantDbContext context,
        IUser user
    )
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.ChatRoom>()
                    .AnyAsync(cr => cr.Id == id, cancellationToken);
            }).WithMessage("Chat room not found.");

        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                if (!Guid.TryParse(user.Id, out var userId))
                {
                    return false;
                }

                return await context.GetSet<Novologs.Domain.Entities.ChatRoom>()
                    .AnyAsync(cr => cr.Id == id && cr.CreatorId == userId, cancellationToken);
            }).WithMessage("Only the creator can update a chat room.");

        RuleFor(v => v.Name)
            .NotEmpty().When(v => v.Name != null).WithMessage("Name cannot be empty if provided.");

        RuleFor(v => v.MemberIds)
            .MustAsync(async (memberIds, cancellationToken) =>
            {
                if (memberIds == null || memberIds.Count == 0) return true;
                var distinctMemberIds = memberIds.Distinct().ToList();
                var existingUsersCount = await context.GetSet<Novologs.Domain.Entities.TenantUser>()
                    .CountAsync(u => distinctMemberIds.Contains(u.Id) && u.IsActive, cancellationToken);
                return existingUsersCount == distinctMemberIds.Count;
            }).When(v => v.MemberIds != null).WithMessage("One or more member IDs are invalid or inactive.");

        RuleFor(v => v.MemberIds)
            .Must(memberIds => memberIds == null || memberIds.Distinct().Count() == memberIds.Count)
            .When(v => v.MemberIds != null).WithMessage("Duplicate member IDs are not allowed.");
    }
}

public class UpdateChatRoomCommandHandler : IRequestHandler<UpdateChatRoomCommand, Result<UpdateChatRoomResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly IMemoryCache _cache;

    public UpdateChatRoomCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user,
        IMemoryCache cache
    )
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _cache = cache;
    }

    public async Task<Result<UpdateChatRoomResponse>> Handle(UpdateChatRoomCommand request,
        CancellationToken cancellationToken)
    {
        var chatRoom = await _context.GetSet<Novologs.Domain.Entities.ChatRoom>()
            .Include(cr => cr.Members)
            .FirstOrDefaultAsync(cr => cr.Id == request.Id, cancellationToken);

        if (chatRoom == null)
        {
            return Result<UpdateChatRoomResponse>.Failure("ChatRoom_001", "Chat room not found.");
        }

        if (request.Name != null)
        {
            chatRoom.Name = request.Name;
        }

        if (request.MemberIds != null)
        {
            var currentMemberIds = chatRoom.Members.Select(m => m.MemberId).ToList();
            var newMemberIds = request.MemberIds.Distinct().ToList();

            var membersToAdd = newMemberIds.Except(currentMemberIds).ToList();
            var membersToRemove = currentMemberIds.Except(newMemberIds).ToList();

            if (!Guid.TryParse(_user.Id, out var creatorId))
            {
                return Result<UpdateChatRoomResponse>.Failure("ChatRoom_002", "Creator not found.");
            }
            
            membersToRemove.Remove(creatorId);

            foreach (var memberId in membersToAdd)
            {
                _context.GetSet<Novologs.Domain.Entities.ChatRoomMember>().Add(new()
                {
                    MemberId = memberId, ChatRoomId = chatRoom.Id, Role = ChatRoomMemberRole.Member
                });
            }

            var membersToRemoveEntities = chatRoom.Members
                .Where(m => membersToRemove.Contains(m.MemberId))
                .ToList();

            foreach (var memberToRemove in membersToRemoveEntities)
            {
                _context.GetSet<Novologs.Domain.Entities.ChatRoomMember>().Remove(memberToRemove);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        if (request.MemberIds != null)
        {
            _cache.Remove($"room:members:{request.Id}");
        }

        return Result<UpdateChatRoomResponse>.Success(new UpdateChatRoomResponse());
    }
}
