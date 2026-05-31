using Novologs.Application.Modules.Chat.ChatMessages.Dto;

namespace Novologs.Application.Modules.Chat.Services;

public interface IChatVoiceProcessingService
{
    /// <summary>
    /// Transcribes an audio file and returns transcript with translations
    /// </summary>
    /// <param name="audioFileId">The ID of the audio file in the Folder entity</param>
    /// <returns>ChatVoiceMessageData containing transcripts in multiple languages</returns>
    Task<ChatVoiceMessageData> TranscribeAudioAsync(Guid audioFileId);

    /// <summary>
    /// Transcribes an audio file by URL (legacy messages that stored URL in PayLoad)
    /// </summary>
    /// <param name="audioUrl">Direct URL to the audio file</param>
    /// <returns>ChatVoiceMessageData containing transcripts in multiple languages</returns>
    Task<ChatVoiceMessageData> TranscribeAudioFromUrlAsync(string audioUrl);
}
