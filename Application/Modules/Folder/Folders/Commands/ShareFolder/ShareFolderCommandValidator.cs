using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Folder.Folders.Commands.ShareFolder;

public class ShareFolderCommandValidator : AbstractValidator<ShareFolderCommand>
{
    public ShareFolderCommandValidator(
        ITenantDbContext context,
        IUser user
    )
    {
        RuleFor(v => v.Members)
            .MustAsync(async (members, cancellationToken) =>
            {
                if (members == null || !members.Any())
                {
                    return true;
                }

                var memberIds = members.Select(m => m.Id).ToList();
                var existingUsers = await context.GetSet<Novologs.Domain.Entities.TenantUser>()
                    .Where(u => memberIds.Contains(u.Id))
                    .Select(u => u.Id)
                    .ToListAsync(cancellationToken);

                return memberIds.All(id => existingUsers.Contains(id));
            }).WithMessage("One or more shared user IDs are invalid.");

        Guid.TryParse(user.Id, out var userGuid);

        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                var folder = await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .Include(f => f.Shares)
                    .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

                if (folder == null)
                {
                    return false;
                }

                return folder.CreatorId == userGuid || folder.Shares.Any(s => s.SharedWithUserId == userGuid);
            }).WithMessage("Folder not found or you don't have permission to share it.");
        
        RuleFor(v => v.Id)
            .MustAsync(async (model, id, ct) =>
            {
                var parent = await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(l => l.Id == id, ct);
                if (parent == null) return true;
                return parent.Type == FolderType.Normal || parent.Type == FolderType.Shared;
            })
            .WithMessage("Can't write to this Folder.");
    }
}
