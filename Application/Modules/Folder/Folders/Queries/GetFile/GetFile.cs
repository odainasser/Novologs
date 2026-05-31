using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;

namespace Novologs.Application.Modules.Folder.Folders.Queries.GetFile;

public record GetFileQuery : IRequest<Result<FileStorageDto>>
{
    public Guid Id { get; set; }
}

public class GetFileQueryValidator : AbstractValidator<GetFileQuery>
{
    private readonly IUser _user;

    public GetFileQueryValidator(ITenantDbContext context, IUser user)
    {
        _user = user;
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .AnyAsync(c => c.Id == id && c.IsFile, cancellationToken);
            }).WithMessage("File not found.");
    }
}

public class GetFileQueryHandler : IRequestHandler<GetFileQuery, Result<FileStorageDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IFileUtileService _fileUtileService;

    public GetFileQueryHandler(
        ITenantDbContext context,
        IFileUtileService fileUtileService
    )
    {
        _context = context;
        _fileUtileService = fileUtileService;
    }

    public async Task<Result<FileStorageDto>> Handle(GetFileQuery request, CancellationToken cancellationToken)
    {
        var file = await _fileUtileService.GetFile(request.Id);
        if (file == null)
        {
            return Result<FileStorageDto>.Failure("Folder_006", "File not found.");
        }

        return Result<FileStorageDto>.Success(file);
    }
}
