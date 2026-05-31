

using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Document.CommentItems.Commands.AddCommentItem;

public record AddCommentItemCommand : IRequest<Result<AddCommentItemResponse>>
{
    public Guid ThreadId { get; set; }
    public string? Content { get; set; }
    public List<Guid>? FilesIds { get; set; } = new();
    public List<Guid>? MentionedUsersIds { get; set; } = new();
    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddCommentItemCommand, Novologs.Domain.Entities.CommentItem>()
                .ForMember(dest => dest.Files, opt => opt.Ignore())
                .ForMember(dest => dest.Mentions, opt => opt.Ignore());
        }
    }

}

public class AddCommentItemResponse
{
    public Guid Id { get; set; }
}

public class AddCommentItemCommandHandler : IRequestHandler<AddCommentItemCommand, Result<AddCommentItemResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public AddCommentItemCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<AddCommentItemResponse>> Handle(AddCommentItemCommand request, CancellationToken cancellationToken)
    {
        var commentItem = _mapper.Map<Novologs.Domain.Entities.CommentItem>(request);
        commentItem.SenderId = Guid.Parse(_user.Id!);

        if (request.FilesIds != null)
        {
            foreach (var fileId in request.FilesIds)
            {
                commentItem.Files.Add(new Novologs.Domain.Entities.CommentFile() { FileId = fileId });
            }
        }

        if (request.MentionedUsersIds != null)
        {
            foreach (var userId in request.MentionedUsersIds)
            {
                commentItem.Mentions.Add(new Novologs.Domain.Entities.CommentMention() { UserId = userId });
            }
        }

        _context.GetSet<Novologs.Domain.Entities.CommentItem>().Add(commentItem);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddCommentItemResponse>.Success(new AddCommentItemResponse() { Id = commentItem.Id });
    }
}
