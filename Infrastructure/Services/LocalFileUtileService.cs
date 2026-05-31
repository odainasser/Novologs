using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Novologs.Domain.Entities;
using SystemLoaders.Services;
using Novologs.Application.Common.Interfaces;

namespace Microsoft.Extensions.DependencyInjection.Services;

public class LocalFileUtileService : IFileUtileService
{
    private readonly ITenantDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;
    private readonly string _basePath;

    public LocalFileUtileService(
        ITenantDbContext context,
        IConfiguration configuration,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor
    )
    {
        _context = context;
        _configuration = configuration;
        _multiTenantContextAccessor = multiTenantContextAccessor;
        _basePath = _configuration.GetSection("LocalStorageBasePath").Get<string>() ??
                    Path.Combine(Directory.GetCurrentDirectory(), "uploads");
    }

    public async Task<FileStorageDto> UploadFile(IFormFile file)
    {
        var tenant = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        if (tenant == null)
        {
            throw new InvalidOperationException("Tenant information is not available.");
        }

        var tenantIdentifier = tenant.Identifier;
        if (string.IsNullOrEmpty(tenantIdentifier))
        {
            throw new InvalidOperationException("Tenant identifier is null or empty.");
        }

        var tenantPath = Path.Combine(_basePath, tenantIdentifier);
        Directory.CreateDirectory(tenantPath);

        string fileExtension = Path.GetExtension(file.FileName);
        string fileName = Guid.NewGuid().ToString() + fileExtension;
        var filePath = Path.Combine(tenantPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var url =
            $"{_configuration.GetSection("DefaultHttpSchema").Get<string>()}{tenantIdentifier}." +
            $"{_configuration.GetSection("DefaultDomain").Get<string>()}" +
            $"/uploads/{tenantIdentifier}/{fileName}";
        var fileStorageDto = new FileStorageDto
        {
            Name = file.FileName,
            MimeType = file.ContentType,
            Size = file.Length,
            Path = filePath,
            Url = url,
        };

        return fileStorageDto;
    }


    public async Task<FileStorageDto> UploadFile(IFormFile file, string folder)
    {
        var tenant = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        if (tenant == null)
            throw new InvalidOperationException("Tenant information is not available.");

        var tenantIdentifier = tenant.Identifier;
        if (string.IsNullOrEmpty(tenantIdentifier))
            throw new InvalidOperationException("Tenant identifier is null or empty.");

        var subFolder = folder.Replace('/', Path.DirectorySeparatorChar);
        var tenantPath = Path.Combine(_basePath, tenantIdentifier, subFolder);
        Directory.CreateDirectory(tenantPath);

        string fileExtension = Path.GetExtension(file.FileName);
        string fileName = Guid.NewGuid().ToString() + fileExtension;
        var filePath = Path.Combine(tenantPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var url =
            $"{_configuration.GetSection("DefaultHttpSchema").Get<string>()}{tenantIdentifier}." +
            $"{_configuration.GetSection("DefaultDomain").Get<string>()}" +
            $"/uploads/{tenantIdentifier}/{folder.TrimEnd('/')}/{fileName}";

        return new FileStorageDto
        {
            Name     = file.FileName,
            MimeType = file.ContentType,
            Size     = file.Length,
            Path     = filePath,
            Url      = url,
        };
    }

    public async Task<FileStorageDto> CopyFile(Guid Id)
    {
        var file = await _context.GetSet<Novologs.Domain.Entities.Folder>().FirstOrDefaultAsync(f => f.Id == Id);
        if (file == null)
        {
            return new FileStorageDto();
        }
        var tenantIdentifier = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo?.Identifier ?? "default";

        // Determine source directory; if missing, fallback to tenant root
        var sourcePath = file.Path ?? string.Empty;
        var sourceDir = !string.IsNullOrEmpty(sourcePath) ? Path.GetDirectoryName(sourcePath) : null;

        // Default uploads root for tenant
        var tenantPath = Path.Combine(_basePath, tenantIdentifier);
        // If source directory is under base path, reuse same directory; otherwise copy to tenant root
        string targetDir;
        if (!string.IsNullOrEmpty(sourceDir) && sourceDir.StartsWith(tenantPath, System.StringComparison.OrdinalIgnoreCase))
        {
            targetDir = sourceDir!;
        }
        else
        {
            targetDir = tenantPath;
        }
        // Preserve relative subfolders from the original file path if possible
        var originalPath = file.Path ?? string.Empty;
        var originalDir = Path.GetDirectoryName(originalPath) ?? string.Empty;
        string relativeDir = string.Empty;
        if (!string.IsNullOrEmpty(originalDir) && originalDir.StartsWith(tenantPath, System.StringComparison.OrdinalIgnoreCase))
        {
            relativeDir = originalDir.Substring(tenantPath.Length).TrimStart(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        }
        if (!string.IsNullOrEmpty(relativeDir))
        {            targetDir = Path.Combine(tenantPath, relativeDir);
        }
        Directory.CreateDirectory(targetDir);
        
        string fileExtension = Path.GetExtension(file.Name);
        string newFileName = Guid.NewGuid().ToString() + fileExtension;
        var newFilePath = Path.Combine(targetDir, newFileName);
        File.Copy(file.Path!, newFilePath);
        
        // Build URL relative to uploads path preserving subfolders
        var relativePath = newFilePath.StartsWith(tenantPath, System.StringComparison.OrdinalIgnoreCase)
            ? newFilePath.Substring(tenantPath.Length).TrimStart(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
            : newFileName;
        var fileStorageDto = new FileStorageDto
        {
            Name = file.Name,
            MimeType = file.MimeType,
            Size = file.Size,
            Url = $"/uploads/{tenantIdentifier}/{relativePath.Replace(Path.DirectorySeparatorChar, '/')}",
            Path = newFilePath
        };
        
        return fileStorageDto;
    }

    public async Task<FileStorageDto> CopyFileToFolder(Guid Id, string folder)
    {
        var file = await _context.GetSet<Novologs.Domain.Entities.Folder>().FirstOrDefaultAsync(f => f.Id == Id);
        if (file == null)
        {
            return new FileStorageDto();
        }
        var tenantIdentifier = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo?.Identifier ?? "default";
        var subFolder = folder.Replace('/', Path.DirectorySeparatorChar).TrimStart(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        var targetDir = Path.Combine(_basePath, tenantIdentifier, subFolder);
        Directory.CreateDirectory(targetDir);
        string fileExtension = Path.GetExtension(file.Name);
        string newFileName = Guid.NewGuid().ToString() + fileExtension;
        var newFilePath = Path.Combine(targetDir, newFileName);
        File.Copy(file.Path!, newFilePath);
                var tenantPath = Path.Combine(_basePath, tenantIdentifier);
        var relativePath = newFilePath.StartsWith(tenantPath, System.StringComparison.OrdinalIgnoreCase)
            ? newFilePath.Substring(tenantPath.Length).TrimStart(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
            : newFileName;
        var fileStorageDto = new FileStorageDto
        {            Name = file.Name,            MimeType = file.MimeType,            Size = file.Size,            Url = $"/uploads/{tenantIdentifier}/{relativePath.Replace(Path.DirectorySeparatorChar, '/')}",            Path = newFilePath
        };
        return fileStorageDto;
    }

    public Task DeleteFile(string path)
    {        if (File.Exists(path))        {            File.Delete(path);        }
        return Task.CompletedTask;    }

    public async Task<FileStorageDto> GetFile(Guid Id)
    {        var file = await _context.GetSet<Novologs.Domain.Entities.Folder>().FirstOrDefaultAsync(f => f.Id == Id);        if (file == null)        {            return new FileStorageDto();        }        var fileStorageDto = new FileStorageDto        {            Name = file.Name,            MimeType = file.MimeType,            Size = file.Size,            Url = file.Url!,            Path = file.Path!,        };        return fileStorageDto;    }
}