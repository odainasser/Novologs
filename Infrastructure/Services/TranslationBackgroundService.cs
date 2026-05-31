using Hangfire;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Modules.Tasks.Services;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Services;

public class TranslationBackgroundService : ITranslationBackgroundService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<TranslationBackgroundService> _logger;
    private readonly ITenantDbContext _context;

    public TranslationBackgroundService(
        IConfiguration configuration,
        ILogger<TranslationBackgroundService> logger,
        ITenantDbContext context)
    {
        _configuration = configuration;
        _logger = logger;
        _context = context;
    }

    [AutomaticRetry(Attempts = 2)]
    public async System.Threading.Tasks.Task TranslateTaskTextAsync(Guid taskId, Guid tenantId, string rawText)
    {
        _logger.LogInformation("Background translation started for task {TaskId}, tenant {TenantId}", taskId, tenantId);
        try
        {
            var geminiStt = new GeminiStt(_configuration);
            var transcript = await geminiStt.GetTextTranscript(rawText);

            if (transcript == null || string.IsNullOrWhiteSpace(transcript.TranscriptStr))
            {
                _logger.LogWarning("Gemini returned empty result in background job for task {TaskId} (rawText length={Len})", taskId, rawText.Length);
                return;
            }

            _logger.LogInformation(
                "Gemini translation completed for task {TaskId}: lang={Lang}, en={HasEn}, ar={HasAr}",
                taskId,
                transcript.TranscriptLanguageStr,
                !string.IsNullOrWhiteSpace(transcript.TranscriptEnglishStr),
                !string.IsNullOrWhiteSpace(transcript.TranscriptArabicStr));

            var task = await _context.GetSet<ProjectTask>().FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null)
            {
                _logger.LogWarning("Task {TaskId} not found when persisting background translation result", taskId);
                return;
            }

            task.Description = System.Text.Json.JsonSerializer.Serialize(transcript);
            await _context.SaveChangesAsync(CancellationToken.None);

            _logger.LogInformation("Translation persisted successfully for task {TaskId}", taskId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Background translation job failed for task {TaskId}", taskId);
            throw; // re-throw so Hangfire can retry
        }
    }
}
