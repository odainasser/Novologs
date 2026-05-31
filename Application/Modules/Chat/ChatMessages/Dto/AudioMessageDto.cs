namespace Novologs.Application.Modules.Chat.ChatMessages.Dto;

public class AudioMessageDto
{
    public Guid AudioFileId { get; set; }
    public string? AudioFileUrl { get; set; }
    public bool IsTranscribed { get; set; }
    public AudioDescriptionDto? Description { get; set; }
}

public class AudioDescriptionDto
{
    public string? TranscriptLanguageStr { get; set; }
    public string? TranscriptStr { get; set; }
    public string? TranscriptEnglishStr { get; set; }
    public string? TranscriptArabicStr { get; set; }
}
