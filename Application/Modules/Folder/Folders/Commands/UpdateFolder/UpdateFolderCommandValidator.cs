using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Folder.Folders.Commands.UpdateFolder;

public class UpdateFolderCommandValidator : AbstractValidator<UpdateFolderCommand>
{
    public UpdateFolderCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Folder not found."); 

        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                var folder = await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
                if (folder == null) return false;
                Guid.TryParse(user.Id, out var userId);
                return folder.CreatorId == userId;
            }).WithMessage("You are not allowed to update this folder.");


        RuleFor(v => v.Name)
            .NotEmpty()
            .MaximumLength(200)
            .MustAsync(async (model, name, ct) =>
            {
                var folder = await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(f => f.Id == model.Id, ct);
                if (folder == null) return false; 
                var parentId = folder.ParentFolderId;

                if (parentId == null)
                {
                    return !await context.GetSet<Novologs.Domain.Entities.Folder>()
                        .AnyAsync(
                            l => l.ParentFolderId == null && l.Name == name && l.CreatorId == folder.CreatorId &&
                                 l.Id != model.Id, ct);
                }

                return !await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .AnyAsync(l => l.ParentFolderId == parentId && l.Name == name && l.Id != model.Id, ct);
            })
            .WithMessage("'Name' must be unique within the parent folder.");
        RuleFor(v => v.Members)
            .MustAsync(async (members, ct) =>
            {
                if (members == null || !members.Any()) return true;
                var ids = members.Select(m => m.Id).ToList();
                return await context.GetSet<Novologs.Domain.Entities.TenantUser>()
                    .CountAsync(l => ids.Contains(l.Id) && l.IsActive, ct) == ids.Count;
            })
            .WithMessage("Invalid or inactive member IDs.");

        RuleFor(v => v.Id)
            .MustAsync(async (model, id, ct) =>
            {
                var parent = await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(l => l.Id == id, ct);
                if (parent == null) return true;
                return parent.Type == FolderType.Normal || parent.Type == FolderType.Shared;
            })
            .WithMessage("Can't write to this Folder.");
        
        RuleFor(v => v.Members)
            .Must(members =>
            {
                if (members == null || !members.Any()) return true;
                var distinctMembers = members.Select(m => m.Id).Distinct().Count();
                return distinctMembers == members.Count;
            })
            .WithMessage("Members must be unique.");
    }
}
