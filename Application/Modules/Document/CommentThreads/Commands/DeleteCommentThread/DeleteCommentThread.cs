using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Document.CommentThreads.Commands.DeleteCommentThread;

public record DeleteCommentThreadCommand : IRequest<Result<DeleteCommentThreadResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteCommentThreadResponse
{
}

public class DeleteCommentThreadCommandValidator : AbstractValidator<DeleteCommentThreadCommand>
{
    public DeleteCommentThreadCommandValidator(ITenantDbContext context, IUser user)
    {
    
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.CommentThread>()
                    .AnyAsync(t => t.Id == id, cancellationToken);
            }).WithMessage("Comment thread does not exist.");
    }
}

public class
    DeleteCommentThreadCommandHandler : IRequestHandler<DeleteCommentThreadCommand, Result<DeleteCommentThreadResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public DeleteCommentThreadCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<DeleteCommentThreadResponse>> Handle(DeleteCommentThreadCommand request,
        CancellationToken cancellationToken)
    {
        var commentThread = await _context.GetSet<Novologs.Domain.Entities.CommentThread>()
            .FindAsync(new object[] { request.Id }, cancellationToken);

        if (commentThread == null)
        {
            return Result<DeleteCommentThreadResponse>.Failure("NotFound", "Comment thread not found.");
        }

        _context.GetSet<Novologs.Domain.Entities.CommentThread>().Remove(commentThread);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteCommentThreadResponse>.Success(new DeleteCommentThreadResponse());
    }
}
