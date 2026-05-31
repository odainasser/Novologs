namespace SystemLoaders.Services;

public interface IVoiceProcessingService
{
    Task<TaskVoiceFileData?> ProcessTaskVoiceFileAsync(Guid voiceFileId, Guid taskId);
    Task<TaskVoiceFileData?> ProcessTaskTextAsync(string description);
}