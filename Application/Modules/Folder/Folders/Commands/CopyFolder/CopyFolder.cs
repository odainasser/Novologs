using Finbuckle.MultiTenant.Abstractions;
using Microsoft.Extensions.Configuration;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;

namespace Novologs.Application.Modules.Folder.Folders.Commands.CopyFolder;

public record CopyFolderCommand : IRequest<Result<CopyFolderResponse>>
{
    public string? DestinationNewName { get; set; }
    public Guid Source { get; set; }
    public Guid Destination { get; set; }
}

public class CopyFolderResponse
{
}

public class CopyFolderCommandHandler : IRequestHandler<CopyFolderCommand, Result<CopyFolderResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly IFileUtileService _fileUtileService;
    private readonly IConfiguration _configuration;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public CopyFolderCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user,
        IFileUtileService fileUtileService,
        IConfiguration configuration,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor
    )
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _fileUtileService = fileUtileService;
        _configuration = configuration;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<Result<CopyFolderResponse>> Handle(CopyFolderCommand request, CancellationToken cancellationToken)
    {
        if (_user.Id == null)
        {
            return Result<CopyFolderResponse>.Failure("Folder_013", "User not authenticated.");
        }

        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<CopyFolderResponse>.Failure("Folder_014", "Invalid user ID format.");
        }

        var sourceFile = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .FirstOrDefaultAsync(f => f.Id == request.Source && f.IsFile, cancellationToken);

        if (sourceFile == null)
        {
            return Result<CopyFolderResponse>.Failure("Folder_015", "Source file not found.");
        }

        var destinationFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .FirstOrDefaultAsync(f => f.Id == request.Destination && !f.IsFile, cancellationToken);

        if (destinationFolder == null)
        {
            return Result<CopyFolderResponse>.Failure("Folder_016", "Destination folder not found.");
        }

        try
        {
            // Copy the source file into the destination folder's storage path
            var destinationFolderPath = $"Folders/{request.Destination}";
            var copiedFileDto = await _fileUtileService.CopyFileToFolder(request.Source, destinationFolderPath);
            var newFileEntity = new Novologs.Domain.Entities.Folder
            {
                Name = request.DestinationNewName ?? sourceFile.Name,
                IsFile = true,
                ParentFolderId = request.Destination,
                CreatorId = userId,
                MimeType = copiedFileDto.MimeType,
                Size = copiedFileDto.Size,
                Path = copiedFileDto.Path,
                Url = copiedFileDto.Url,
                ProjectId = destinationFolder.ProjectId,
                MilestoneId = destinationFolder.MilestoneId,
                ClientId = destinationFolder.ClientId,
                LeadId = destinationFolder.LeadId,
                VendorId = destinationFolder.VendorId,
                ContractId = destinationFolder.ContractId,
                TaskId = destinationFolder.TaskId
            };
            if (string.IsNullOrWhiteSpace(copiedFileDto.Url))
            {
                newFileEntity.Url = copiedFileDto.Url =
                    _configuration.GetSection("DefaultHttpSchema").Get<string>() + "://" +
                    _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo?.Identifier + "." +
                    _configuration.GetSection("DefaultDomain").Get<string>() +
                    $"/folder/getFile/{newFileEntity.Id}";
            }

            _context.GetSet<Novologs.Domain.Entities.Folder>().Add(newFileEntity);
            await _context.SaveChangesAsync(cancellationToken);

            return Result<CopyFolderResponse>.Success(new CopyFolderResponse());
        }
        catch (Exception ex)
        {
            return Result<CopyFolderResponse>.Failure("Folder_017", $"File copy failed: {ex.Message}");
        }
    }
}
