using Novologs.Application.Modules.Chat.ChatMessages.Queries.GetChatMessage;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Chat.ChatMessages.Queries.GetMention;

public record GetMentionQuery : IRequest<Result<GetMentionResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetMentionResponse : FilteredResult<MentionedMessageDto>
{
}

public class MentionedMessageDto
{
    public Guid MentionId { get; set; }
    public DateTime MentionedAt { get; set; }
    public Guid MessageId { get; set; }
    public string? PayLoad { get; set; }
    public Guid? ChatRoomId { get; set; }
    public ChatUserDto? Sender { get; set; }
    public DateTime MessageCreated { get; set; }
}

public class GetMentionQueryHandler : IRequestHandler<GetMentionQuery, Result<GetMentionResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public GetMentionQueryHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<GetMentionResponse>> Handle(GetMentionQuery request,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(_user.Id, out var userId))
            return Result<GetMentionResponse>.Failure("Mention_001", "User not found.");

        var result = new GetMentionResponse();

        var query = _context.GetSet<Novologs.Domain.Entities.ChatMessageMention>()
            .AsNoTracking()
            .Where(m => m.UserId == userId && m.IsDeleted == false);

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);
        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        var mentions = await query
            .Include(m => m.ChatMessage)
                .ThenInclude(msg => msg!.Sender)
                    .ThenInclude(s => s!.ProfileImageFile)
            .ToListAsync(cancellationToken);

        result.Items = mentions.Select(m => new MentionedMessageDto
        {
            MentionId     = m.Id,
            MentionedAt   = m.Created.DateTime,
            MessageId     = m.ChatMessageId,
            PayLoad       = m.ChatMessage?.PayLoad,
            ChatRoomId    = m.ChatMessage?.ChatRoomId,
            Sender        = _mapper.Map<ChatUserDto>(m.ChatMessage?.Sender),
            MessageCreated = m.ChatMessage?.Created.DateTime ?? default
        }).ToList();

        return Result<GetMentionResponse>.Success(result);
    }
}
