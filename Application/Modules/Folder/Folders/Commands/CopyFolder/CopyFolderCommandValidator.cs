using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Folder.Folders.Commands.CopyFolder;

public class CopyFolderCommandValidator : AbstractValidator<CopyFolderCommand>
{
    public CopyFolderCommandValidator(ITenantDbContext context, IUser user)
    {
    
        RuleFor(v => v.Source)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .AnyAsync(f => f.Id == id && f.IsFile, cancellationToken);
            }).WithMessage("Source must be a valid file.");

        RuleFor(v => v.Destination)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .AnyAsync(f => f.Id == id && !f.IsFile, cancellationToken);
            }).WithMessage("Destination must be a valid folder.");

        Guid.TryParse(user.Id, out var userGuid);
        RuleFor(v => v.Source)
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
            }).WithMessage("You don't have permission to copy the source folder.");
        RuleFor(v => v.Destination)
            .MustAsync(async (id, cancellationToken) =>
            {
                var folder = await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

                if (folder == null)
                {
                    return false;
                }

                return folder.CreatorId == userGuid;
            }).WithMessage("You don't have permission to copy to the destination folder.");

        RuleFor(v => v.Source)
            .MustAsync(async (id, cancellationToken) =>
            {
                var folder = await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);

                if (folder == null)
                {
                    return false;
                }

                return folder.IsFile;
            }).WithMessage("Only files can be copied.");

        RuleFor(v => v)
            .MustAsync(async (command, cancellationToken) =>
            {  
                var sourceFile = await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(f => f.Id == command.Source, cancellationToken);

                if (sourceFile == null)
                {
                    return false;
                }

                var nameToCompare = (command.DestinationNewName ?? sourceFile.Name).Trim().ToLower();
                return !await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .AnyAsync(f => f.ParentFolderId == command.Destination &&
                                   f.Name.ToLower() == nameToCompare, cancellationToken);
            }).WithMessage("A file with the same name already exists in the destination folder.");
    }
}
