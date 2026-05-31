using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Document.CommentItems.Commands.UpdateCommentItem;

public record UpdateCommentItemCommand : IRequest<Result<UpdateCommentItemResponse>>
{
    public Guid Id { get; set; }
    public string? Content { get; set; }
    public List<Guid>? FilesIds { get; set; } = new();
    public List<Guid>? MentionedUsersIds { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateCommentItemCommand, Novologs.Domain.Entities.CommentItem>()
                .ForMember(dest => dest.Files, opt => opt.Ignore())
                .ForMember(dest => dest.Mentions, opt => opt.Ignore());
        }
    }
}

public class UpdateCommentItemResponse
{
}

public class
    UpdateCommentItemCommandHandler : IRequestHandler<UpdateCommentItemCommand, Result<UpdateCommentItemResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public UpdateCommentItemCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<UpdateCommentItemResponse>> Handle(UpdateCommentItemCommand request,
        CancellationToken cancellationToken)
    {
        var commentItem = await _context.GetSet<Novologs.Domain.Entities.CommentItem>()
            .Include(i => i.Files)
            .Include(i => i.Mentions)
            .FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken);

        if (commentItem == null)
        {
            return Result<UpdateCommentItemResponse>.Failure("NotFound", "Comment item not found.");
        }

        _mapper.Map(request, commentItem);

        if (request.FilesIds != null)
        {
            foreach (var commentFile in commentItem.Files.ToList())
            {
                if (!request.FilesIds.Contains(commentFile.FileId))
                {
                    _context.GetSet<Novologs.Domain.Entities.CommentFile>().Remove(commentFile);
                }
            }

            foreach (var fileId in request.FilesIds)
            {
                if (!commentItem.Files.Any(f => f.FileId == fileId))
                {
                    _context.GetSet<Novologs.Domain.Entities.CommentFile>()
                        .Add(new() { CommentItemId = commentItem.Id, FileId = fileId });
                }
            }
        }


        if (request.MentionedUsersIds != null)
        {
            foreach (var commentMention in commentItem.Mentions.ToList())
            {
                if (!request.MentionedUsersIds.Contains(commentMention.UserId))
                {
                    _context.GetSet<Novologs.Domain.Entities.CommentMention>().Remove(commentMention);
                }
            }

            foreach (var userId in request.MentionedUsersIds)
            {
                if (!commentItem.Mentions.Any(m => m.UserId == userId))
                {
                    _context.GetSet<Novologs.Domain.Entities.CommentMention>()
                        .Add(new() { CommentItemId = commentItem.Id, UserId = userId });
                }
            }
        }


        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateCommentItemResponse>.Success(new UpdateCommentItemResponse());
    }
}
