using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Document.CommentItems.Commands.DeleteCommentItem;

public record DeleteCommentItemCommand : IRequest<Result<DeleteCommentItemResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteCommentItemResponse
{
}

public class DeleteCommentItemCommandValidator : AbstractValidator<DeleteCommentItemCommand>
{
    public DeleteCommentItemCommandValidator(ITenantDbContext context, IUser user)
    {
    
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.CommentItem>()
                    .AnyAsync(i => i.Id == id, cancellationToken);
            }).WithMessage("Comment item does not exist.");
    }
}

public class
    DeleteCommentItemCommandHandler : IRequestHandler<DeleteCommentItemCommand, Result<DeleteCommentItemResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public DeleteCommentItemCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<DeleteCommentItemResponse>> Handle(DeleteCommentItemCommand request,
        CancellationToken cancellationToken)
    {
        var commentItem = await _context.GetSet<Novologs.Domain.Entities.CommentItem>()
            .FindAsync(new object[] { request.Id }, cancellationToken);

        if (commentItem == null)
        {
            return Result<DeleteCommentItemResponse>.Failure("NotFound", "Comment item not found.");
        }

        _context.GetSet<Novologs.Domain.Entities.CommentItem>().Remove(commentItem);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteCommentItemResponse>.Success(new DeleteCommentItemResponse());
    }
}
