using Novologs.Application.Modules.Chat.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Chat.ChatMessages.Commands.ToggleReaction;

public record ToggleReactionCommand : IRequest<Result<ToggleReactionResponse>>
{
    public Guid MessageId { get; set; }
    public string Emoji { get; set; } = string.Empty;
}

public class ToggleReactionResponse
{
    public bool Added { get; set; }
    public ReactionSummaryDto? Reaction { get; set; }
}

public class ReactionSummaryDto
{
    public string Emoji { get; set; } = string.Empty;
    public int Count { get; set; }
    public bool CurrentUserReacted { get; set; }
    public List<ChatUserDto> Users { get; set; } = new();
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

public class ToggleReactionCommandValidator : AbstractValidator<ToggleReactionCommand>
{
    public ToggleReactionCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Emoji)
            .NotEmpty()
            .WithMessage("Emoji is required.");

        RuleFor(v => v.MessageId)
            .MustAsync(async (messageId, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.ChatMessage>()
                    .AnyAsync(m => m.Id == messageId, cancellationToken);
            }).WithMessage("Message not found.");
    }
}

public class ToggleReactionCommandHandler : IRequestHandler<ToggleReactionCommand, Result<ToggleReactionResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly IChatMessageCacheService _msgCache;

    public ToggleReactionCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user,
        IChatMessageCacheService msgCache)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _msgCache = msgCache;
    }

    public async Task<Result<ToggleReactionResponse>> Handle(ToggleReactionCommand request,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<ToggleReactionResponse>.Failure("Reaction_001", "User not found.");
        }

        // Check if message exists
        var message = await _context.GetSet<Novologs.Domain.Entities.ChatMessage>()
            .Include(m => m.Reactions)
                .ThenInclude(r => r.User)
                    .ThenInclude(u => u!.ProfileImageFile)
            .FirstOrDefaultAsync(m => m.Id == request.MessageId, cancellationToken);

        if (message == null)
        {
            return Result<ToggleReactionResponse>.Failure("Reaction_002", "Message not found.");
        }

        // Check for ANY existing reaction from this user on this message (including soft-deleted)
        var existingReaction = await _context.GetSet<Novologs.Domain.Entities.ChatMessageReaction>()
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.ChatMessageId == request.MessageId && r.UserId == userId,
                cancellationToken);

        bool added;

        if (existingReaction != null)
        {
            // User already has a reaction on this message
            if (existingReaction.Emoji == request.Emoji && !existingReaction.IsDeleted)
            {
                // Same emoji and not deleted - toggle off (hard delete)
                await _context.GetSet<Novologs.Domain.Entities.ChatMessageReaction>()
                    .Where(r => r.Id == existingReaction.Id)
                    .ExecuteDeleteAsync(cancellationToken);
                added = false;
            }
            else
            {
                // Different emoji or was soft-deleted - update to new emoji and restore
                existingReaction.Emoji = request.Emoji;
                existingReaction.IsDeleted = false;
                existingReaction.LastModified = DateTime.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);
                added = true;
            }
        }
        else
        {
            // No existing reaction - create new
            var newReaction = new Novologs.Domain.Entities.ChatMessageReaction
            {
                ChatMessageId = request.MessageId,
                UserId = userId,
                Emoji = request.Emoji,
                IsDeleted = false
            };
            await _context.GetSet<Novologs.Domain.Entities.ChatMessageReaction>()
                .AddAsync(newReaction, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            added = true;
        }

        // Retrieve updated reaction summary for this emoji
        var reactions = await _context.GetSet<Novologs.Domain.Entities.ChatMessageReaction>()
            .Include(r => r.User)
                .ThenInclude(u => u!.ProfileImageFile)
            .Where(r => r.ChatMessageId == request.MessageId && r.Emoji == request.Emoji && r.IsDeleted == false)
            .ToListAsync(cancellationToken);

        var reactionSummary = reactions.Any()
            ? new ReactionSummaryDto
            {
                Emoji = request.Emoji,
                Count = reactions.Count,
                CurrentUserReacted = reactions.Any(r => r.UserId == userId),
                Users = reactions.Select(r => _mapper.Map<ChatUserDto>(r.User)).ToList()
            }
            : null;

        if (message.ChatRoomId.HasValue && _user.Tenant != null)
        {
            _msgCache.InvalidateRoom(_user.Tenant, message.ChatRoomId.Value);
        }

        return Result<ToggleReactionResponse>.Success(new ToggleReactionResponse
        {
            Added = added,
            Reaction = reactionSummary
        });
    }
}
