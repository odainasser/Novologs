using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Document.CommentItems.Commands.UpdateCommentItem;

public class UpdateCommentItemCommandValidator : AbstractValidator<UpdateCommentItemCommand>
{
    public UpdateCommentItemCommandValidator(ITenantDbContext context, IMapper mapper, IUser user)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.CommentItem>()
                    .AnyAsync(i => i.Id == id, cancellationToken);
            }).WithMessage("Comment item does not exist.");

        RuleFor(v => v.Content)
            .MaximumLength(4096).WithMessage("Content must not exceed 4096 characters.");

        RuleFor(v => v.FilesIds)
            .MustAsync(async (filesIds, cancellationToken) =>
            {
                if (filesIds == null || !filesIds.Any()) return true;
                var existingFilesCount = await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .CountAsync(f => filesIds.Contains(f.Id) && f.IsFile, cancellationToken);
                return existingFilesCount == filesIds.Count();
            }).WithMessage("One or more files do not exist or are not files.");

        RuleFor(v => v.MentionedUsersIds)
            .MustAsync(async (mentionedUsersIds, cancellationToken) =>
            {
                if (mentionedUsersIds == null || !mentionedUsersIds.Any()) return true;
                var existingUsersCount = await context.GetSet<Novologs.Domain.Entities.TenantUser>()
                    .CountAsync(u => mentionedUsersIds.Contains(u.Id), cancellationToken);
                return existingUsersCount == mentionedUsersIds.Count();
            }).WithMessage("One or more mentioned users do not exist.");

    }
}
