using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Document.CommentThreads.Commands.AddCommentThread;

public record AddCommentThreadCommand : IRequest<Result<AddCommentThreadResponse>>
{
}

public class AddCommentThreadResponse
{
    public Guid Id { get; set; }
}

public class AddCommentThreadCommandValidator : AbstractValidator<AddCommentThreadCommand>
{
    public AddCommentThreadCommandValidator(ITenantDbContext context, IUser user)
    {
    }
}

public class AddCommentThreadCommandHandler : IRequestHandler<AddCommentThreadCommand, Result<AddCommentThreadResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public AddCommentThreadCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<AddCommentThreadResponse>> Handle(AddCommentThreadCommand request,
        CancellationToken cancellationToken)
    {
        var commentThread = new Novologs.Domain.Entities.CommentThread();
        _context.GetSet<Novologs.Domain.Entities.CommentThread>().Add(commentThread);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddCommentThreadResponse>.Success(new AddCommentThreadResponse() { Id = commentThread.Id });
    }
}
