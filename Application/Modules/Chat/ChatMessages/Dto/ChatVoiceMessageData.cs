using System.Text.Json;

namespace Novologs.Application.Modules.Chat.ChatMessages.Dto;

public class ChatVoiceMessageData
{
    public string? AudioFileUrl { get; set; }
    public string? TranscriptLanguageStr { get; set; }
    public string? TranscriptStr { get; set; }
    public string? TranscriptEnglishStr { get; set; }
    public string? TranscriptArabicStr { get; set; }

    /// <summary>
    /// Serializes the ChatVoiceMessageData to JSON string
    /// </summary>
    /// <returns>JSON string representation</returns>
    public string ToJson()
    {
        return JsonSerializer.Serialize(this);
    }

    /// <summary>
    /// Parses a JSON string into ChatVoiceMessageData object
    /// </summary>
    /// <param name="jsonPayload">JSON string containing voice message data</param>
    /// <returns>Parsed ChatVoiceMessageData or null if parsing fails</returns>
    public static ChatVoiceMessageData? FromJson(string? jsonPayload)
    {
        if (string.IsNullOrWhiteSpace(jsonPayload))
            return null;

        try
        {
            return JsonSerializer.Deserialize<ChatVoiceMessageData>(jsonPayload);
        }
        catch
        {
            // If JSON parsing fails, not voice data
            return null;
        }
    }

    /// <summary>
    /// Checks if the payload string contains voice message data (JSON format)
    /// </summary>
    /// <param name="payload">Payload string to check</param>
    /// <returns>True if payload is voice message JSON, false otherwise</returns>
    public static bool IsVoiceData(string? payload)
    {
        if (string.IsNullOrWhiteSpace(payload))
            return false;

        try
        {
            var data = JsonSerializer.Deserialize<ChatVoiceMessageData>(payload);
            return data != null && 
                   (data.TranscriptStr != null || 
                    data.TranscriptEnglishStr != null || 
                    data.TranscriptArabicStr != null);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Checks if the payload has been transcribed (not empty)
    /// </summary>
    /// <param name="payload">Payload string to check</param>
    /// <returns>True if transcription data exists</returns>
    public static bool IsTranscribed(string? payload)
    {
        var data = FromJson(payload);
        return data != null && 
               (!string.IsNullOrWhiteSpace(data.TranscriptStr) ||
                !string.IsNullOrWhiteSpace(data.TranscriptEnglishStr) ||
                !string.IsNullOrWhiteSpace(data.TranscriptArabicStr));
    }

    /// <summary>
    /// Gets the transcript text in the specified language
    /// Falls back to TranscriptStr if the requested language is not available
    /// </summary>
    /// <param name="preferArabic">True for Arabic, False for English</param>
    /// <returns>Transcript text in the requested language</returns>
    public string GetTranscript(bool preferArabic = false)
    {
        if (preferArabic && !string.IsNullOrWhiteSpace(TranscriptArabicStr))
            return TranscriptArabicStr;
        
        if (!preferArabic && !string.IsNullOrWhiteSpace(TranscriptEnglishStr))
            return TranscriptEnglishStr;
        
        return TranscriptStr ?? string.Empty;
    }

    /// <summary>
    /// Gets the English transcript text
    /// </summary>
    public string GetEnglishTranscript() => GetTranscript(preferArabic: false);

    /// <summary>
    /// Gets the Arabic transcript text
    /// </summary>
    public string GetArabicTranscript() => GetTranscript(preferArabic: true);
}
