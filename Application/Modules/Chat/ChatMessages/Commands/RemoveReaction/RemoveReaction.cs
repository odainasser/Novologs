using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Chat.ChatMessages.Commands.RemoveReaction;

public record RemoveReactionCommand : IRequest<Result>
{
    public Guid MessageId { get; set; }
    public string Emoji { get; set; } = string.Empty;
}

public class RemoveReactionCommandValidator : AbstractValidator<RemoveReactionCommand>
{
    public RemoveReactionCommandValidator(ITenantDbContext context, IUser user)
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

public class RemoveReactionCommandHandler : IRequestHandler<RemoveReactionCommand, Result>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public RemoveReactionCommandHandler(
        ITenantDbContext context,
        IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<Result> Handle(RemoveReactionCommand request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result.Failure("Reaction_001", "User not found.");
        }

        var reaction = await _context.GetSet<Novologs.Domain.Entities.ChatMessageReaction>()
            .FirstOrDefaultAsync(r => r.ChatMessageId == request.MessageId && r.UserId == userId && r.Emoji == request.Emoji && r.IsDeleted == false,
                cancellationToken);

        if (reaction == null)
        {
            return Result.Failure("Reaction_002", "Reaction not found.");
        }

        // Hard delete the reaction (bypass soft delete interceptor)
        await _context.GetSet<Novologs.Domain.Entities.ChatMessageReaction>()
            .Where(r => r.Id == reaction.Id)
            .ExecuteDeleteAsync(cancellationToken);

        return Result.Success();
    }
}
