namespace Novologs.Application.Modules.Tasks.Services;

public interface ITranslationBackgroundService
{
    System.Threading.Tasks.Task TranslateTaskTextAsync(Guid taskId, Guid tenantId, string rawText);
}
