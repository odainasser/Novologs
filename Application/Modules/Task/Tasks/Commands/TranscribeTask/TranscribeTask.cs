using Finbuckle.MultiTenant.Abstractions;
using Hangfire;
using Microsoft.Extensions.Logging;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Application.Modules.Tasks.Services;

namespace Novologs.Application.Modules.Tasks.Tasks.Commands.TranscribeTask;

public record TranscribeTaskCommand : IRequest<Result<TranscribeTaskResponse>>
{
    public Guid TaskId { get; set; }
}

public class TranscribeTaskResponse
{
    public string? TranscriptStr { get; set; }
    public string? TranscriptLanguageStr { get; set; }
    public string? TranscriptEnglishStr { get; set; }
    public string? TranscriptArabicStr { get; set; }
}

public class TranscribeTaskCommandHandler : IRequestHandler<TranscribeTaskCommand, Result<TranscribeTaskResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IVoiceProcessingService _voiceProcessingService;
    private readonly IBackgroundJobClient _jobClient;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _tenantContextAccessor;
    private readonly ILogger<TranscribeTaskCommandHandler> _logger;

    public TranscribeTaskCommandHandler(
        ITenantDbContext context,
        IVoiceProcessingService voiceProcessingService,
        IBackgroundJobClient jobClient,
        IMultiTenantContextAccessor<AppTenantInfo> tenantContextAccessor,
        ILogger<TranscribeTaskCommandHandler> logger)
    {
        _context = context;
        _voiceProcessingService = voiceProcessingService;
        _jobClient = jobClient;
        _tenantContextAccessor = tenantContextAccessor;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task<Result<TranscribeTaskResponse>> Handle(
        TranscribeTaskCommand request,
        CancellationToken cancellationToken)
    {
        var task = await _context.GetSet<ProjectTask>()
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            return Result<TranscribeTaskResponse>.Failure("Task_001", "Task not found.");

        // Return cached transcript only if fully translated â€” skip Gemini call
        var cached = TaskVoiceFileData.FromJson(task.Description);
        if (cached != null
            && !string.IsNullOrWhiteSpace(cached.TranscriptStr)
            && !string.IsNullOrWhiteSpace(cached.TranscriptLanguageStr)
            && (!string.IsNullOrWhiteSpace(cached.TranscriptEnglishStr) || !string.IsNullOrWhiteSpace(cached.TranscriptArabicStr)))
        {
            return Result<TranscribeTaskResponse>.Success(new TranscribeTaskResponse
            {
                TranscriptStr = cached.TranscriptStr,
                TranscriptLanguageStr = cached.TranscriptLanguageStr,
                TranscriptEnglishStr = cached.TranscriptEnglishStr,
                TranscriptArabicStr = cached.TranscriptArabicStr
            });
        }

        TaskVoiceFileData? transcript;

        if (task.AudioFileId != null)
        {
            // Audio path â€” transcribe via Gemini STT
            transcript = await _voiceProcessingService.ProcessTaskVoiceFileAsync(task.AudioFileId.Value, task.Id);

            if (transcript == null)
                return Result<TranscribeTaskResponse>.Failure("Task_011", "Transcription failed.");
        }
        else
        {
            // Text path â€” prefer the already-parsed TranscriptStr to avoid passing raw JSON as input
            var rawDescription = cached?.TranscriptStr?.Trim() ?? task.Description?.Trim();
            if (string.IsNullOrWhiteSpace(rawDescription))
                return Result<TranscribeTaskResponse>.Failure("Task_010", "Task has no content to translate.");

            transcript = await _voiceProcessingService.ProcessTaskTextAsync(rawDescription);

            if (transcript == null || string.IsNullOrWhiteSpace(transcript.TranscriptLanguageStr))
            {
                // Gemini failed synchronously â€” enqueue a background retry and return partial data
                _logger.LogWarning(
                    "Gemini text translation failed synchronously for task {TaskId} â€” enqueuing background retry",
                    task.Id);

                var tenantInfo = _tenantContextAccessor.MultiTenantContext?.TenantInfo;
                if (tenantInfo != null)
                {
                    _jobClient.Enqueue<ITranslationBackgroundService>(svc =>
                        svc.TranslateTaskTextAsync(task.Id, tenantInfo.Id, rawDescription));
                }

                // Return what we have â€” translations will be populated once the background job completes
                return Result<TranscribeTaskResponse>.Success(new TranscribeTaskResponse
                {
                    TranscriptStr = rawDescription,
                    TranscriptLanguageStr = transcript?.TranscriptLanguageStr,
                    TranscriptEnglishStr = transcript?.TranscriptEnglishStr,
                    TranscriptArabicStr = transcript?.TranscriptArabicStr
                });
            }
        }

        task.Description = System.Text.Json.JsonSerializer.Serialize(transcript);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<TranscribeTaskResponse>.Success(new TranscribeTaskResponse
        {
            TranscriptStr = transcript.TranscriptStr,
            TranscriptLanguageStr = transcript.TranscriptLanguageStr,
            TranscriptEnglishStr = transcript.TranscriptEnglishStr,
            TranscriptArabicStr = transcript.TranscriptArabicStr
        });
    }
}
