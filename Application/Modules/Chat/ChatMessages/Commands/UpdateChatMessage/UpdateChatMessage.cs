using Novologs.Application.Modules.Chat.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Chat.ChatMessages.Commands.UpdateChatMessage;

public record UpdateChatMessageCommand : IRequest<Result<UpdateChatMessageResponse>>
{
    public Guid Id { get; set; }
    public string? PayLoad { get; set; } 
    
    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateChatMessageCommand, Novologs.Domain.Entities.ChatMessage>()
                .ForMember(dest => dest.PayLoad, opt => opt.MapFrom(src => src.PayLoad));
        }
    }

}

public class UpdateChatMessageResponse
{
}

public class UpdateChatMessageCommandValidator : AbstractValidator<UpdateChatMessageCommand>
{
    public UpdateChatMessageCommandValidator(
        ITenantDbContext context,
        IUser user
    )
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.ChatMessage>()
                    .AnyAsync(m => m.Id == id, cancellationToken);
            }).WithMessage("Chat message not found.");

        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                if (!Guid.TryParse(user.Id, out var userId))
                {
                    return false;
                }

                return await context.GetSet<Novologs.Domain.Entities.ChatMessage>()
                    .AnyAsync(m => m.Id == id && m.SenderId == userId, cancellationToken);
            }).WithMessage("Only the sender can update a chat message.");

        RuleFor(v => v.PayLoad)
            .NotEmpty().WithMessage("Payload is required.");
    }
}

public class
    UpdateChatMessageCommandHandler : IRequestHandler<UpdateChatMessageCommand, Result<UpdateChatMessageResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly IChatMessageCacheService _msgCache;

    public UpdateChatMessageCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user,
        IChatMessageCacheService msgCache
    )
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _msgCache = msgCache;
    }

    public async Task<Result<UpdateChatMessageResponse>> Handle(UpdateChatMessageCommand request,
        CancellationToken cancellationToken)
    {
        var chatMessage = await _context.GetSet<Novologs.Domain.Entities.ChatMessage>()
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);
        if (chatMessage == null)
        {
            return Result<UpdateChatMessageResponse>.Failure("ChatMessage_001", "Chat message not found.");
        }

        _mapper.Map(request, chatMessage);

        await _context.SaveChangesAsync(cancellationToken);

        if (chatMessage.ChatRoomId.HasValue && _user.Tenant != null)
        {
            _msgCache.InvalidateRoom(_user.Tenant, chatMessage.ChatRoomId.Value);
        }

        return Result<UpdateChatMessageResponse>.Success(new UpdateChatMessageResponse());
    }
}
