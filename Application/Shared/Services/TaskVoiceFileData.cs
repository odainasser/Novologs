using System.Text.Json;

namespace SystemLoaders.Services;

public class TaskVoiceFileData
{
    public string? TranscriptLanguageStr { get; set; }
    public string? TranscriptStr { get; set; }
    public string? TranscriptEnglishStr { get; set; }
    public string? TranscriptArabicStr { get; set; }

    /// <summary>
    /// Parses a JSON string into TaskVoiceFileData object
    /// </summary>
    /// <param name="jsonDescription">JSON string containing task description</param>
    /// <returns>Parsed TaskVoiceFileData or null if parsing fails</returns>
    public static TaskVoiceFileData? FromJson(string? jsonDescription)
    {
        if (string.IsNullOrWhiteSpace(jsonDescription))
            return null;

        try
        {
            return JsonSerializer.Deserialize<TaskVoiceFileData>(jsonDescription);
        }
        catch
        {
            // If JSON parsing fails, treat it as plain text
            return new TaskVoiceFileData { TranscriptStr = jsonDescription };
        }
    }

    /// <summary>
    /// Gets the description text in the specified language (English or Arabic)
    /// Falls back to TranscriptStr if the requested language is not available
    /// </summary>
    /// <param name="preferArabic">True for Arabic, False for English</param>
    /// <returns>Description text in the requested language</returns>
    public string GetDescription(bool preferArabic = false)
    {
        if (preferArabic && !string.IsNullOrWhiteSpace(TranscriptArabicStr))
            return TranscriptArabicStr;
        
        if (!preferArabic && !string.IsNullOrWhiteSpace(TranscriptEnglishStr))
            return TranscriptEnglishStr;
        
        return TranscriptStr ?? string.Empty;
    }

    /// <summary>
    /// Gets the English description text
    /// </summary>
    public string GetEnglishDescription() => GetDescription(preferArabic: false);

    /// <summary>
    /// Gets the Arabic description text
    /// </summary>
    public string GetArabicDescription() => GetDescription(preferArabic: true);

    /// <summary>
    /// Helper method to parse JSON and get description in one call
    /// </summary>
    /// <param name="jsonDescription">JSON string containing task description</param>
    /// <param name="preferArabic">True for Arabic, False for English</param>
    /// <returns>Description text in the requested language</returns>
    public static string GetDescriptionFromJson(string? jsonDescription, bool preferArabic = false)
    {
        var data = FromJson(jsonDescription);
        return data?.GetDescription(preferArabic) ?? jsonDescription ?? string.Empty;
    }
}
