using MessageTemplates.Services;
using Microsoft.EntityFrameworkCore;
using Novologs.Domain.Enums;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.Common.Helpers;

/// <summary>
/// Helper for sending multi-language notifications.
/// Automatically groups users by their language preference and sends localized notifications.
/// </summary>
public static class NotificationHelper
{
    /// <summary>
    /// Sends notifications to users in their preferred language.
    /// Fetches user language preferences, groups by language, and sends separate notifications per language.
    /// </summary>
    public static async Task SendNotificationWithUserLanguages(
        this INotificationService notificationService,
        ITenantDbContext context,
        MessageType messageType,
        Guid? tenantId,
        List<Guid> userIds,
        object templateData,
        CancellationToken cancellationToken = default)
    {
        if (userIds == null || !userIds.Any())
            return;

        // Fetch user language preferences
        var userLanguages = await context.GetSet<TenantUser>()
            .Where(u => userIds.Contains(u.Id))
            .Select(u => new { u.Id, u.Language })
            .ToDictionaryAsync(u => u.Id, u => u.Language ?? "en", cancellationToken);

        // Group users by language
        var languageGroups = userIds
            .GroupBy(userId => userLanguages.GetValueOrDefault(userId, "en"))
            .ToList();

        // Send separate notification for each language group
        foreach (var group in languageGroups)
        {
            var language = group.Key;
            var usersForLanguage = group.ToList();

            notificationService.SendNotification(
                messageType,
                tenantId,
                usersForLanguage,
                language,
                templateData);
        }
    }
}
