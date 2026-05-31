using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using FFMpegCore;
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using SystemLoaders.Services;

namespace Novologs.Application.Modules.Tasks.Services;

public class VoiceProcessingService : IVoiceProcessingService
{
    private readonly ITenantDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IFileUtileService _fileUtileService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;
    private readonly ILogger<VoiceProcessingService> _logger;

    public VoiceProcessingService(
        ITenantDbContext context,
        IConfiguration configuration,
        IFileUtileService fileUtileService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor,
        ILogger<VoiceProcessingService> logger
    )
    {
        _context = context;
        _configuration = configuration;
        _fileUtileService = fileUtileService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
        _logger = logger;
    }

    public async Task<TaskVoiceFileData?> ProcessTaskVoiceFileAsync(Guid voiceFileId, Guid taskId)
    {
        try
        {
            var voiceFile = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                .FirstOrDefaultAsync(f => f.Id == voiceFileId);

            if (voiceFile == null || !voiceFile.IsFile || string.IsNullOrEmpty(voiceFile.Url))
            {
                return new TaskVoiceFileData { TranscriptStr = null };
            }

            var transcript = new TaskVoiceFileData();

            var geminiStt = new GeminiStt(_configuration);

            string? tempAudioPath = null;
            try
            {
                tempAudioPath = await DownloadAndConvertAudioFileAsync(voiceFile);
                transcript = await geminiStt.TranscribeAudioGeminiAsync(tempAudioPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gemini audio transcription failed for voice file {VoiceFileId}", voiceFileId);
                throw;
            }
            finally
            {
                if (tempAudioPath != null)
                {
                    CleanupTempFiles(tempAudioPath);
                }
            }

            return transcript;
        }
        catch (Exception e)
        {
            _logger.LogError(e, "ProcessTaskVoiceFileAsync failed for voice file {VoiceFileId}", voiceFileId);
            return null;
        }
    }

    public async Task<TaskVoiceFileData?> ProcessTaskTextAsync(string description)
    {
        try
        {
            var geminiStt = new GeminiStt(_configuration);
            var transcript = await geminiStt.GetTextTranscript(description);
            return transcript;
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Gemini text translation failed for description: {Desc}", description[..Math.Min(100, description.Length)]);
            return null;
        }
    }


    private async Task<string> DownloadAndConvertAudioFileAsync(Novologs.Domain.Entities.Folder audioFile)
    {
        var _httpClient = new HttpClient();
        var originalExtension = Path.GetExtension(audioFile.Url);
        var tempInputFile = Path.Combine(Path.GetTempPath(), $"audio_{Guid.NewGuid()}{originalExtension}");
        var tempMp3File = Path.Combine(Path.GetTempPath(), $"audio_{Guid.NewGuid()}.mp3");

        try
        {
            var audioBytes = await _httpClient.GetByteArrayAsync(audioFile.Url);
            await File.WriteAllBytesAsync(tempInputFile, audioBytes);
            FFMpegArguments
                .FromFileInput(tempInputFile)
                .OutputToFile(tempMp3File, overwrite: true, options =>
                    options.WithAudioCodec("libmp3lame"))
                .ProcessSynchronously();

            var fileInfo = new FileInfo(tempMp3File);
            using (var stream = fileInfo.OpenRead())
            {
                var formFile = new FormFile(stream, 0, fileInfo.Length, "file", fileInfo.Name)
                {
                    Headers = new HeaderDictionary(), ContentType = "audio/mpeg"
                };
                await _fileUtileService.DeleteFile(audioFile.Path!);
                var uploadedFile = await _fileUtileService.UploadFile(formFile);
                if (string.IsNullOrWhiteSpace(uploadedFile.Url))
                {
                    uploadedFile.Url = _configuration.GetSection("DefaultHttpSchema").Get<string>() +
                                       _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo?.Identifier + "." +
                                       _configuration.GetSection("DefaultDomain").Get<string>() +
                                       $"/folder/getFile/{audioFile.Id}";
                }

                audioFile.Name = audioFile.Name.Replace("." + originalExtension, "") + ".mp3";
                audioFile.Url = uploadedFile.Url;
                audioFile.Path = uploadedFile.Path;
                audioFile.Size = uploadedFile.Size;
                audioFile.MimeType = uploadedFile.MimeType;
                _context.GetSet<Novologs.Domain.Entities.Folder>().Update(audioFile);
                await _context.SaveChangesAsync(CancellationToken.None);
            }

            return tempMp3File;
        }
        finally
        {
            if (File.Exists(tempInputFile))
                File.Delete(tempInputFile);
        }
    }

    private void CleanupTempFiles(params string[] filePaths)
    {
        foreach (var filePath in filePaths)
        {
            if (File.Exists(filePath))
            {
                try
                {
                    File.Delete(filePath);
                }
                catch (Exception)
                {
                    // Log error if needed
                }
            }
        }
    }
}
