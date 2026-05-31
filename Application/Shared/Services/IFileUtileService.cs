using Microsoft.AspNetCore.Http;

namespace SystemLoaders.Services;

public interface IFileUtileService
{
    Task<FileStorageDto> UploadFile(IFormFile file);
    Task<FileStorageDto> UploadFile(IFormFile file, string folder);
    Task<FileStorageDto> CopyFile(Guid Id);
    Task<FileStorageDto> CopyFileToFolder(Guid Id, string folder);
    Task DeleteFile(string path);
    Task<FileStorageDto> GetFile(Guid Id);
}

public class FileStorageDto
{
    public string? Name { get; set; }
    public string? MimeType { get; set; }
    public long? Size { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public byte[]? Content { get; set; }
}