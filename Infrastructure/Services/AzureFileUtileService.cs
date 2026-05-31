using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Novologs.Domain.Entities;
using SystemLoaders.Services;
using Novologs.Application.Common.Interfaces;

namespace Microsoft.Extensions.DependencyInjection.Services;

public class AzureFileUtileService : IFileUtileService
{
    private readonly ITenantDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public AzureFileUtileService(
        ITenantDbContext context,
        IConfiguration configuration,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor
    )
    {
        _context = context;
        _configuration = configuration;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<FileStorageDto> UploadFile(IFormFile file)
    {
        var connectionString = this._configuration.GetSection("AzureFileStorageConnectionStr").Get<string>();

        var tenantIdentifier = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo?.Identifier;
        var publicDomain = _configuration["PUBLIC_DOMAIN"] ?? tenantIdentifier;
        var containerName = publicDomain!.Replace(".", "-");
        string fileExtension = Path.GetExtension(file.FileName);
        string blobName = $"{tenantIdentifier}/{Guid.NewGuid()}{fileExtension}";
        BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

        BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

        BlobClient blobClient = containerClient.GetBlobClient(blobName);
        var blobHttpHeader = new BlobHttpHeaders
        {
            ContentType = file.ContentType, CacheControl = "public, max-age=3600, must-revalidate"
        };
        if (file.ContentType.StartsWith("audio/"))
        {
            blobHttpHeader.ContentType = "audio/mpeg";
        }
        else if (file.ContentType.StartsWith("video/"))
        {
            blobHttpHeader.ContentType = "video/mp4";
        }
        else if (file.ContentType.StartsWith("image/"))
        {
            blobHttpHeader.ContentType = "image/jpeg";
        }
        else if (file.ContentType == "application/pdf")
        {
            blobHttpHeader.ContentType = "application/pdf";
        }

        BlobUploadOptions blobHeader = new BlobUploadOptions { HttpHeaders = blobHttpHeader };

        using (Stream fileStream = file.OpenReadStream())
        {
            await blobClient.UploadAsync(fileStream, blobHeader);
        }

        var azureFile = new FileStorageDto()
        {
            Name = file.FileName,
            MimeType = file.ContentType,
            Size = file.Length,
            Url = blobClient.Uri.AbsoluteUri,
            Path = blobName,
        };
        return azureFile;
    }

    public async Task<FileStorageDto> UploadFile(IFormFile file, string folder)
    {
        var connectionString = this._configuration.GetSection("AzureFileStorageConnectionStr").Get<string>();

        var tenantIdentifier = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo?.Identifier;
        var publicDomain = _configuration["PUBLIC_DOMAIN"] ?? tenantIdentifier;
        var containerName = publicDomain!.Replace(".", "-");
        string fileExtension = Path.GetExtension(file.FileName);
        string blobName = $"{tenantIdentifier}/{folder.TrimEnd('/')}/{Guid.NewGuid()}{fileExtension}";
        BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

        BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

        BlobClient blobClient = containerClient.GetBlobClient(blobName);
        var blobHttpHeader = new BlobHttpHeaders
        {
            ContentType = file.ContentType, CacheControl = "public, max-age=3600, must-revalidate"
        };
        if (file.ContentType.StartsWith("audio/"))
            blobHttpHeader.ContentType = "audio/mpeg";
        else if (file.ContentType.StartsWith("video/"))
            blobHttpHeader.ContentType = "video/mp4";
        else if (file.ContentType.StartsWith("image/"))
            blobHttpHeader.ContentType = "image/jpeg";
        else if (file.ContentType == "application/pdf")
            blobHttpHeader.ContentType = "application/pdf";

        BlobUploadOptions blobHeader = new BlobUploadOptions { HttpHeaders = blobHttpHeader };

        using (Stream fileStream = file.OpenReadStream())
        {
            await blobClient.UploadAsync(fileStream, blobHeader);
        }

        return new FileStorageDto
        {
            Name     = file.FileName,
            MimeType = file.ContentType,
            Size     = file.Length,
            Url      = blobClient.Uri.AbsoluteUri,
            Path     = blobName,
        };
    }

    public async Task<FileStorageDto> CopyFile(Guid Id)
    {
        var file = await _context.GetSet<Novologs.Domain.Entities.Folder>().FirstOrDefaultAsync(f => f.Id == Id);
        if (file == null)
        {
            return new FileStorageDto();
        }

        var connectionString = this._configuration.GetSection("AzureFileStorageConnectionStr").Get<string>();
        var tenantIdentifier = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo?.Identifier;
        var publicDomain = _configuration["PUBLIC_DOMAIN"] ?? tenantIdentifier;
        var containerName = publicDomain!.Replace(".", "-");

        BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);

        // original blob client (uses the stored path)
        BlobClient blobClient = blobServiceClient.GetBlobContainerClient(containerName).GetBlobClient(file.Path!);

        string fileExtension = Path.GetExtension(file.Name);

        // Preserve any folder/subfolder prefix from the original path (keep everything up to last '/')
        var originalPath = file.Path ?? string.Empty;
        var prefix = string.Empty;
        var lastSlash = originalPath.LastIndexOf('/');
        if (lastSlash >= 0)
        {
            prefix = originalPath.Substring(0, lastSlash + 1); // includes trailing slash
        }

        string newBlobName = $"{prefix}{Guid.NewGuid()}{fileExtension}";
        BlobClient newBlobClient = blobServiceClient.GetBlobContainerClient(containerName).GetBlobClient(newBlobName);

        await newBlobClient.StartCopyFromUriAsync(blobClient.Uri);

        var azureFile = new FileStorageDto()
        {
            Name = file.Name,
            MimeType = file.MimeType,
            Size = file.Size,
            Url = newBlobClient.Uri.AbsoluteUri,
            Path = newBlobName,
        };
        return azureFile;
    }

    public async Task<FileStorageDto> CopyFileToFolder(Guid Id, string folder)
    {
        var file = await _context.GetSet<Novologs.Domain.Entities.Folder>().FirstOrDefaultAsync(f => f.Id == Id);
        if (file == null)
        {
            return new FileStorageDto();
        }

        var connectionString = this._configuration.GetSection("AzureFileStorageConnectionStr").Get<string>();
        var tenantIdentifier = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo?.Identifier;
        var publicDomain = _configuration["PUBLIC_DOMAIN"] ?? tenantIdentifier;
        var containerName = publicDomain!.Replace(".", "-");

        BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);
        BlobClient sourceBlob = blobServiceClient.GetBlobContainerClient(containerName).GetBlobClient(file.Path!);

        string fileExtension = Path.GetExtension(file.Name);
        var blobFolder = folder.Trim('/');
        string newBlobName = $"{tenantIdentifier}/{(string.IsNullOrEmpty(blobFolder) ? "" : blobFolder + "/")}{Guid.NewGuid()}{fileExtension}";
        BlobClient newBlobClient = blobServiceClient.GetBlobContainerClient(containerName).GetBlobClient(newBlobName);

        await newBlobClient.StartCopyFromUriAsync(sourceBlob.Uri);

        var azureFile = new FileStorageDto()
        {
            Name = file.Name,
            MimeType = file.MimeType,
            Size = file.Size,
            Url = newBlobClient.Uri.AbsoluteUri,
            Path = newBlobName,
        };
        return azureFile;
    }

    public Task DeleteFile(string path)
    {
        var connectionString = this._configuration.GetSection("AzureFileStorageConnectionStr").Get<string>();
        var containerName = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo?.Identifier;
        BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);
        BlobClient blobClient = blobServiceClient.GetBlobContainerClient(containerName).GetBlobClient(path.Trim());
        return blobClient.DeleteIfExistsAsync();
    }

    public async Task<FileStorageDto> GetFile(Guid Id)
    {
        var file = await _context.GetSet<Novologs.Domain.Entities.Folder>().FirstOrDefaultAsync(f => f.Id == Id);
        if (file == null)
        {
            return new FileStorageDto();
        }

        var connectionString = this._configuration.GetSection("AzureFileStorageConnectionStr").Get<string>();
        var containerName = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo?.Identifier;
        BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);
        BlobClient blobClient = blobServiceClient.GetBlobContainerClient(containerName).GetBlobClient(file.Path!);
        var azureFile = new FileStorageDto()
        {
            Name = file.Name,
            MimeType = file.MimeType,
            Size = file.Size,
            Url = blobClient.Uri.AbsoluteUri,
            Path = file.Path ?? "",
            Content = (await blobClient.DownloadContentAsync()).Value.Content.ToArray()
        };
        return azureFile;
    }
}
