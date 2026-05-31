using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;

namespace Novologs.Application.Modules.Document.Documents.Commands.DeleteDocument;

public record DeleteDocumentCommand : IRequest<Result<DeleteDocumentResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteDocumentResponse
{
}

public class DeleteDocumentCommandValidator : AbstractValidator<DeleteDocumentCommand>
{
    public DeleteDocumentCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.DocumentNode>()
                    .AnyAsync(d => d.Id == id, cancellationToken);
            }).WithMessage("Document not found.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                if (user.Id == null) return false;
                var userId = Guid.Parse(user.Id);

                var document = await context.GetSet<Novologs.Domain.Entities.DocumentNode>()
                    .Include(d => d.Members)
                    .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
                if (document == null) return false;
                return document.CreatorId == userId ||
                       document.Members.Any(m =>
                           m.MemberId == userId && (m.Role == Novologs.Domain.Enums.DocumentMemeberRole.Editor ||
                                                    m.Role == Novologs.Domain.Enums.DocumentMemeberRole.Creator));
            }).WithMessage("You are not authorized to delete this document.");
    }
}

public class DeleteDocumentCommandHandler : IRequestHandler<DeleteDocumentCommand, Result<DeleteDocumentResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly IFileUtileService _fileUtileService;

    public DeleteDocumentCommandHandler(ITenantDbContext context, IMapper mapper, IUser user,
        IFileUtileService fileUtileService)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _fileUtileService = fileUtileService;
    }

    public async Task<Result<DeleteDocumentResponse>> Handle(DeleteDocumentCommand request,
        CancellationToken cancellationToken)
    {
        var document = _context.GetSet<Novologs.Domain.Entities.DocumentNode>()
            .Include(d => d.DocumentVersionList).ThenInclude(dv => dv.Files)
            .AsSplitQuery()
            .FirstOrDefault(d => d.Id == request.Id);
        if (document == null)
        {
            return Result<DeleteDocumentResponse>.Failure("Document_002", "Document not found");
        }

        if (document.FolderId != null)
        {
            await deleteFolderOrFile(document.FolderId.Value, cancellationToken);
        }

        foreach (var version in document.DocumentVersionList)
        {
            _context.GetSet<Novologs.Domain.Entities.DocumentVersion>().Remove(version);
            if (version.HeaderImgFileId != null)
            {
                await deleteFolderOrFile(version.HeaderImgFileId.Value, cancellationToken);
            }

            foreach (var file in version.Files)
            {
                await deleteFolderOrFile(file.FileId, cancellationToken);
            }
        }

        foreach (var member in document.Members)
        {
            _context.GetSet<Novologs.Domain.Entities.DocumentNodeMember>().Remove(member);
        }


        foreach (var child in document.ChildrenNodes)
        {
            var deleteChildCommand = new DeleteDocumentCommand { Id = child.Id };
            await Handle(deleteChildCommand, cancellationToken);
        }

        _context.GetSet<Novologs.Domain.Entities.DocumentNode>().Remove(document);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<DeleteDocumentResponse>.Success(new DeleteDocumentResponse());
    }

    private async Task deleteFolderOrFile(Guid id, CancellationToken cancellationToken)
    {
        var folder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .FirstOrDefaultAsync(x => x.Id == id);
        if (folder == null)
        {
            return;
        }

        if (folder.IsFile && string.IsNullOrEmpty(folder.Path) == false)
        {
            await _fileUtileService.DeleteFile(folder.Path);
        }

        _context.GetSet<Novologs.Domain.Entities.Folder>().Remove(folder);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
