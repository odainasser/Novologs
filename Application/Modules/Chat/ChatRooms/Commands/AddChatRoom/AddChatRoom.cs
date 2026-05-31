using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Chat.ChatRooms.Commands.AddChatRoom;

public record AddChatRoomCommand : IRequest<Result<AddChatRoomResponse>>
{
    public string? Code { get; set; }
    public string? Name { get; set; }
    public List<Guid>? MemberIds { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddChatRoomCommand, Novologs.Domain.Entities.ChatRoom>()
                .ForMember(dest => dest.Members, opt => opt.Ignore());
        }
    }
}

public class AddChatRoomResponse
{
    public Guid Id { get; set; }
}

public class AddChatRoomCommandValidator : AbstractValidator<AddChatRoomCommand>
{
    public AddChatRoomCommandValidator(
        ITenantDbContext context,
        IUser user)
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.");

        RuleFor(v => v.MemberIds)
            .MustAsync(async (memberIds, cancellationToken) =>
            {
                if (memberIds == null || memberIds.Count == 0) return true;
                var distinctMemberIds = memberIds.Distinct().ToList();
                var existingUsersCount = await context.GetSet<Novologs.Domain.Entities.TenantUser>()
                    .CountAsync(u => distinctMemberIds.Contains(u.Id) && u.IsActive, cancellationToken);
                return existingUsersCount == distinctMemberIds.Count;
            }).WithMessage("One or more member IDs are invalid or inactive.");

        RuleFor(v => v.MemberIds)
            .Must(memberIds => memberIds == null || memberIds.Distinct().Count() == memberIds.Count)
            .WithMessage("Duplicate member IDs are not allowed.");
    }
}

public class AddChatRoomCommandHandler : IRequestHandler<AddChatRoomCommand, Result<AddChatRoomResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public AddChatRoomCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user
    )
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<AddChatRoomResponse>> Handle(AddChatRoomCommand request,
        CancellationToken cancellationToken)
    {
        var chatRoom = _mapper.Map<Novologs.Domain.Entities.ChatRoom>(request);

        if (!Guid.TryParse(_user.Id, out var creatorId))
        {
            return Result<AddChatRoomResponse>.Failure("ChatRoom_001", "Creator not found.");
        }

        chatRoom.CreatorId = creatorId;

        var creatorMember = chatRoom.Members.FirstOrDefault(m => m.MemberId == creatorId);
        if (creatorMember == null)
        {
            chatRoom.Members.Add(new Novologs.Domain.Entities.ChatRoomMember
            {
                MemberId = creatorId, ChatRoomId = chatRoom.Id, Role = ChatRoomMemberRole.Owner
            });
        }
        else
        {
            creatorMember.Role = ChatRoomMemberRole.Owner;
        }


        if (request.MemberIds != null && request.MemberIds.Count > 0)
        {
            foreach (var memberId in request.MemberIds.Distinct())
            {
                if (memberId != creatorId)
                {
                    chatRoom.Members.Add(new Novologs.Domain.Entities.ChatRoomMember
                    {
                        MemberId = memberId, ChatRoomId = chatRoom.Id, Role = ChatRoomMemberRole.Member
                    });
                }
            }
        }

        await _context.GetSet<Novologs.Domain.Entities.ChatRoom>().AddAsync(chatRoom, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddChatRoomResponse>.Success(new AddChatRoomResponse { Id = chatRoom.Id });
    }
}
