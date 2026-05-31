using System.Text.Json;
using Novologs.Application.Modules.Chat.ChatMessages.Dto;
using Novologs.Application.Modules.Chat.Services;
using FFMpegCore;
using Finbuckle.MultiTenant.Abstractions;
using GenerativeAI;
using GenerativeAI.Types;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Novologs.Application.Common.Interfaces;
using SystemLoaders.Services;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Services;

public class ChatVoiceProcessingService : IChatVoiceProcessingService
{
    private readonly ITenantDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    public ChatVoiceProcessingService(
        ITenantDbContext context,
        IConfiguration configuration,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor
    )
    {
        _context = context;
        _configuration = configuration;
        _multiTenantContextAccessor = multiTenantContextAccessor;
    }

    public async Task<ChatVoiceMessageData> TranscribeAudioAsync(Guid audioFileId)
    {
        try
        {
            var voiceFile = await _context.GetSet<Folder>()
                .FirstOrDefaultAsync(f => f.Id == audioFileId);

            if (voiceFile == null || !voiceFile.IsFile || string.IsNullOrEmpty(voiceFile.Url))
            {
                throw new InvalidOperationException($"Audio file with ID {audioFileId} not found or invalid.");
            }

            string? tempAudioPath = null;
            try
            {
                tempAudioPath = await DownloadAndConvertAudioFileAsync(voiceFile);
                var transcript = await TranscribeAudioWithGeminiAsync(tempAudioPath);
                return transcript;
            }
            finally
            {
                if (tempAudioPath != null)
                {
                    CleanupTempFiles(tempAudioPath);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error transcribing audio: {ex.Message}");
            throw;
        }
    }

    public async Task<ChatVoiceMessageData> TranscribeAudioFromUrlAsync(string audioUrl)
    {
        try
        {
            if (string.IsNullOrEmpty(audioUrl))
                throw new InvalidOperationException("Audio URL is empty.");

            string? tempAudioPath = null;
            try
            {
                tempAudioPath = await DownloadAndConvertAudioFromUrlAsync(audioUrl);
                var transcript = await TranscribeAudioWithGeminiAsync(tempAudioPath);
                return transcript;
            }
            finally
            {
                if (tempAudioPath != null)
                    CleanupTempFiles(tempAudioPath);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error transcribing audio from URL: {ex.Message}");
            throw;
        }
    }

    private async Task<ChatVoiceMessageData> TranscribeAudioWithGeminiAsync(string audioPath)
    {
        var geminiConfig = _configuration.GetSection("Gemini");
        var apiKey = geminiConfig["ApiKey"];
        var modelId = geminiConfig["ModelId"] ?? "gemini-1.5-flash";

        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("Gemini API key not configured.");
        }

        var model = new GenerativeModel(apiKey, modelId);
        model.UseGoogleSearch = false;
        model.UseGrounding = false;
        model.UseCodeExecutionTool = false;

        var request = new GenerateContentRequest();
        var prompt =
            "You are a chat message transcriber. This audio is a voice message from a chat conversation. " +
            "Provide an accurate transcript of the audio. " +
            "Extract the original language of the transcript, the English translation, and the Arabic translation. " +
            "If a translation is not present or the audio is already in one of those languages, translate it to the other languages. " +
            "Format the output as a JSON object with keys 'TranscriptLanguageStr', 'TranscriptStr', 'TranscriptEnglishStr', and 'TranscriptArabicStr'.";

        request.AddText(prompt);
        request.AddInlineFile(audioPath);
        var response = await model.GenerateContentAsync(request);

        if (!string.IsNullOrEmpty(response.Text()))
        {
            try
            {
                var rawResponse = response.Text();
                if (!string.IsNullOrWhiteSpace(rawResponse))
                {
                    var extractedText = ExtractAndCleanJson(rawResponse);
                    var extractedData = JsonSerializer.Deserialize<ChatVoiceMessageData>(extractedText);
                    if (extractedData != null)
                    {
                        return extractedData;
                    }
                }
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"JSON deserialization error: {ex.Message}");
                Console.WriteLine($"Raw response text: {response.Text()}");
                throw new InvalidOperationException("Failed to parse transcription response.", ex);
            }
        }

        throw new InvalidOperationException("Failed to transcribe audio: No response from AI service.");
    }

    private async Task<string> DownloadAndConvertAudioFromUrlAsync(string url)
    {
        var httpClient = new HttpClient();
        var originalExtension = Path.GetExtension(url.Split('?')[0]);
        if (string.IsNullOrEmpty(originalExtension)) originalExtension = ".mp3";
        var tempInputFile = Path.Combine(Path.GetTempPath(), $"chat_audio_{Guid.NewGuid()}{originalExtension}");
        var tempMp3File = Path.Combine(Path.GetTempPath(), $"chat_audio_{Guid.NewGuid()}.mp3");

        try
        {
            var audioBytes = await httpClient.GetByteArrayAsync(url);
            await File.WriteAllBytesAsync(tempInputFile, audioBytes);

            FFMpegArguments
                .FromFileInput(tempInputFile)
                .OutputToFile(tempMp3File, overwrite: true, options =>
                    options.WithAudioCodec("libmp3lame"))
                .ProcessSynchronously();

            return tempMp3File;
        }
        finally
        {
            if (File.Exists(tempInputFile))
                File.Delete(tempInputFile);
        }
    }

    private async Task<string> DownloadAndConvertAudioFileAsync(Folder audioFile)
    {
        var httpClient = new HttpClient();
        var originalExtension = Path.GetExtension(audioFile.Url);
        var tempInputFile = Path.Combine(Path.GetTempPath(), $"chat_audio_{Guid.NewGuid()}{originalExtension}");
        var tempMp3File = Path.Combine(Path.GetTempPath(), $"chat_audio_{Guid.NewGuid()}.mp3");

        try
        {
            var audioBytes = await httpClient.GetByteArrayAsync(audioFile.Url);
            await File.WriteAllBytesAsync(tempInputFile, audioBytes);

            FFMpegArguments
                .FromFileInput(tempInputFile)
                .OutputToFile(tempMp3File, overwrite: true, options =>
                    options.WithAudioCodec("libmp3lame"))
                .ProcessSynchronously();

            return tempMp3File;
        }
        finally
        {
            if (File.Exists(tempInputFile))
                File.Delete(tempInputFile);
        }
    }

    private string ExtractAndCleanJson(string response)
    {
        if (string.IsNullOrWhiteSpace(response))
            return string.Empty;

        try
        {
            response = response.Trim();

            if (response.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
            {
                response = response.Substring(7);
            }
            else if (response.StartsWith("```"))
            {
                response = response.Substring(3);
            }

            if (response.EndsWith("```"))
            {
                response = response.Substring(0, response.Length - 3);
            }

            response = response.Trim();

            var startIndex = response.IndexOf('{');
            var endIndex = response.LastIndexOf('}');

            if (startIndex >= 0 && endIndex > startIndex)
            {
                var jsonPart = response.Substring(startIndex, endIndex - startIndex + 1);
                return jsonPart.Trim();
            }

            if (response.StartsWith("{") && response.EndsWith("}"))
            {
                return response;
            }

            return string.Empty;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error extracting JSON: {ex.Message}");
            return string.Empty;
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
                    // Log error if needed, but don't throw
                }
            }
        }
    }
}
