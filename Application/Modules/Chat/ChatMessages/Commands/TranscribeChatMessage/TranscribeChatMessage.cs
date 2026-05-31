using System.Text.Json;
using Novologs.Application.Modules.Chat.ChatMessages.Dto;
using Novologs.Application.Modules.Chat.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Chat.ChatMessages.Commands.TranscribeChatMessage;

public record TranscribeChatMessageCommand : IRequest<Result<TranscribeChatMessageResponse>>
{
    public Guid MessageId { get; set; }
}

public class TranscribeChatMessageResponse
{
    public AudioMessageDto? Audio { get; set; }
}

public class TranscribeChatMessageCommandValidator : AbstractValidator<TranscribeChatMessageCommand>
{
    public TranscribeChatMessageCommandValidator(
        ITenantDbContext context)
    {
        RuleFor(v => v.MessageId)
            .NotEmpty().WithMessage("MessageId is required.")
            .MustAsync(async (messageId, cancellationToken) =>
            {
                var message = await context.GetSet<Novologs.Domain.Entities.ChatMessage>()
                    .FirstOrDefaultAsync(m => m.Id == messageId, cancellationToken);

                return message != null;
            }).WithMessage("Message not found.")
            .MustAsync(async (messageId, cancellationToken) =>
            {
                var message = await context.GetSet<Novologs.Domain.Entities.ChatMessage>()
                    .FirstOrDefaultAsync(m => m.Id == messageId, cancellationToken);

                if (message == null) return false;

                // Accept new format (AudioFileId) or legacy format (audio URL in PayLoad)
                if (message.AudioFileId != null) return true;

                return ExtractLegacyAudioUrl(message.PayLoad) != null;
            }).WithMessage("Message does not have an audio file to transcribe.");
    }

    // Extracts the audio URL from legacy PayLoad format: {"contentType":"AUDIO","attachments":[{"url":"..."}]}
    internal static string? ExtractLegacyAudioUrl(string? payload)
    {
        if (string.IsNullOrWhiteSpace(payload)) return null;
        try
        {
            var doc = JsonDocument.Parse(payload);
            var root = doc.RootElement;
            if (root.TryGetProperty("contentType", out var ct) &&
                ct.GetString()?.Equals("AUDIO", StringComparison.OrdinalIgnoreCase) == true &&
                root.TryGetProperty("attachments", out var attachments) &&
                attachments.GetArrayLength() > 0)
            {
                var first = attachments[0];
                if (first.TryGetProperty("url", out var urlProp))
                    return urlProp.GetString();
            }
        }
        catch { /* not legacy format */ }
        return null;
    }
}

public class TranscribeChatMessageCommandHandler : IRequestHandler<TranscribeChatMessageCommand, Result<TranscribeChatMessageResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IChatVoiceProcessingService _voiceProcessingService;

    public TranscribeChatMessageCommandHandler(
        ITenantDbContext context,
        IChatVoiceProcessingService voiceProcessingService)
    {
        _context = context;
        _voiceProcessingService = voiceProcessingService;
    }

    public async Task<Result<TranscribeChatMessageResponse>> Handle(
        TranscribeChatMessageCommand request,
        CancellationToken cancellationToken)
    {
        var message = await _context.GetSet<Novologs.Domain.Entities.ChatMessage>()
            .FirstOrDefaultAsync(m => m.Id == request.MessageId, cancellationToken);

        if (message == null)
        {
            return Result<TranscribeChatMessageResponse>.Failure("ChatMessage_003",
                "Message not found.");
        }

        try
        {
            ChatVoiceMessageData transcriptData;
            string? audioFileUrl;

            if (message.AudioFileId != null)
            {
                // New format: AudioFileId points to a Folder record
                var audioFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(f => f.Id == message.AudioFileId, cancellationToken);
                transcriptData = await _voiceProcessingService.TranscribeAudioAsync(message.AudioFileId.Value);
                audioFileUrl = audioFolder?.Url;
            }
            else
            {
                // Legacy format: audio URL embedded in PayLoad JSON
                var legacyUrl = TranscribeChatMessageCommandValidator.ExtractLegacyAudioUrl(message.PayLoad);
                if (legacyUrl == null)
                {
                    return Result<TranscribeChatMessageResponse>.Failure("ChatMessage_004",
                        "Message does not have an audio file.");
                }
                transcriptData = await _voiceProcessingService.TranscribeAudioFromUrlAsync(legacyUrl);
                audioFileUrl = legacyUrl;

                // Migrate legacy message: find the Folder record by URL and update AudioFileId
                var audioFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(f => f.Url == legacyUrl, cancellationToken);
                if (audioFolder != null)
                {
                    message.AudioFileId = audioFolder.Id;
                    audioFileUrl = audioFolder.Url;
                }
            }

            // Persist the audio URL inside the payload so it is never lost
            transcriptData.AudioFileUrl = audioFileUrl;

            // IMPORTANT: We do NOT save the transcript to the database anymore.
            // This endpoint is an individual API that returns the transcript but doesn't overwrite the message.
            // message.PayLoad = transcriptData.ToJson();
            // _context.GetSet<Novologs.Domain.Entities.ChatMessage>().Update(message);
            // await _context.SaveChangesAsync(cancellationToken);

            var audioDto = new AudioMessageDto
            {
                AudioFileId = message.AudioFileId ?? Guid.Empty,
                AudioFileUrl = audioFileUrl,
                IsTranscribed = true,
                Description = new AudioDescriptionDto
                {
                    TranscriptLanguageStr = transcriptData.TranscriptLanguageStr,
                    TranscriptStr = transcriptData.TranscriptStr,
                    TranscriptEnglishStr = transcriptData.TranscriptEnglishStr,
                    TranscriptArabicStr = transcriptData.TranscriptArabicStr
                }
            };

            return Result<TranscribeChatMessageResponse>.Success(
                new TranscribeChatMessageResponse { Audio = audioDto });
        }
        catch (Exception ex)
        {
            return Result<TranscribeChatMessageResponse>.Failure("ChatMessage_006",
                $"Transcription failed: {ex.Message}");
        }
    }
}
