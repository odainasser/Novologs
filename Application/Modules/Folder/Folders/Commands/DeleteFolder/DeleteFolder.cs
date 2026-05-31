using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Folder.Folders.Commands.DeleteFolder;

public record DeleteFolderCommand : IRequest<Result<DeleteFolderResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteFolderResponse
{
}

public class DeleteFolderCommandValidator : AbstractValidator<DeleteFolderCommand>
{
    public DeleteFolderCommandValidator(ITenantDbContext context)
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
                return !await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .AnyAsync(c => c.ParentFolderId == id, cancellationToken);
            }).WithMessage("Folder is not empty.");
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

public class DeleteFolderCommandHandler : IRequestHandler<DeleteFolderCommand, Result<DeleteFolderResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IFileUtileService _fileUtileService;

    public DeleteFolderCommandHandler(
        ITenantDbContext context,
        IFileUtileService fileUtileService
    )
    {
        _context = context;
        _fileUtileService = fileUtileService;
    }

    public async Task<Result<DeleteFolderResponse>> Handle(DeleteFolderCommand request,
        CancellationToken cancellationToken)
    {
        var folder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (folder == null)
        {
            return Result<DeleteFolderResponse>.Failure("Folder_005", "Folder not found.");
        }

        if (folder.IsFile && string.IsNullOrEmpty(folder.Path) == false)
        {
            await _fileUtileService.DeleteFile(folder.Path);
        }

        _context.GetSet<Novologs.Domain.Entities.Folder>().Remove(folder);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteFolderResponse>.Success(new DeleteFolderResponse());
    }
}