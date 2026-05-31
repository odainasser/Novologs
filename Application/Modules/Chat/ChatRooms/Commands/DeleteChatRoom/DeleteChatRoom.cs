using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Chat.ChatRooms.Commands.DeleteChatRoom;

public record DeleteChatRoomCommand : IRequest<Result<DeleteChatRoomResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteChatRoomResponse
{
}

public class DeleteChatRoomCommandValidator : AbstractValidator<DeleteChatRoomCommand>
{
    public DeleteChatRoomCommandValidator(
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
            }).WithMessage("Only the creator can delete a chat room.");
    }
}

public class DeleteChatRoomCommandHandler : IRequestHandler<DeleteChatRoomCommand, Result<DeleteChatRoomResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public DeleteChatRoomCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user
    )
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<DeleteChatRoomResponse>> Handle(DeleteChatRoomCommand request,
        CancellationToken cancellationToken)
    {
        var chatRoom = await _context.GetSet<Novologs.Domain.Entities.ChatRoom>()
            .FirstOrDefaultAsync(cr => cr.Id == request.Id, cancellationToken);

        if (chatRoom == null)
        {
            return Result<DeleteChatRoomResponse>.Failure("ChatRoom_001", "Chat room not found.");
        }

        _context.GetSet<Novologs.Domain.Entities.ChatRoom>().Remove(chatRoom);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteChatRoomResponse>.Success(new DeleteChatRoomResponse());
    }
}
