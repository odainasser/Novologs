using MessageTemplates.Services;
using Microsoft.Extensions.Logging;
using Novologs.Domain.Enums;
using SystemLoaders.Services;

namespace Novologs.Infrastructure.MessageTemplates;

/// <summary>
/// Unified service for sending both emails and notifications.
/// Replaces TaskEmailService, TicketEmailService, and other domain-specific email services.
/// </summary>
public class NotificationService : INotificationService
{
    private readonly IMessageTemplateService _messageTemplateService;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IMessageTemplateService messageTemplateService,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        ILogger<NotificationService> logger)
    {
        _messageTemplateService = messageTemplateService;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _logger = logger;
    }

    /// <summary>
    /// Sends both email and in-app notification to recipients.
    /// </summary>
    public void SendEmailAndNotification(
        MessageType messageType,
        Guid? tenantId,
        List<EmailUserInfo> recipients,
        string language,
        object templateData)
    {
        if (recipients == null || !recipients.Any())
        {
            _logger.LogWarning("No recipients provided for {MessageType}", messageType);
            return;
        }

        // Send email
        SendEmail(messageType, tenantId, recipients, language, templateData);

        // Send notification
        var userIds = recipients
            .Where(r => r.Id.HasValue)
            .Select(r => r.Id!.Value)
            .ToList();

        if (userIds.Any())
        {
            SendNotification(messageType, tenantId, userIds, language, templateData);
        }
    }

    /// <summary>
    /// Sends only email to recipients.
    /// </summary>
    public void SendEmail(
        MessageType messageType,
        Guid? tenantId,
        List<EmailUserInfo> recipients,
        string language,
        object templateData)
    {
        if (recipients == null || !recipients.Any())
        {
            _logger.LogWarning("No recipients provided for email {MessageType}", messageType);
            return;
        }

        try
        {
            var emailData = _messageTemplateService.CreateEmail(
                messageType,
                tenantId,
                recipients,
                language,
                templateData);

            _sendEmailAndNotificationService.SendEmail(emailData);

            _logger.LogInformation(
                "[{MessageType}] Email sent to {Count} recipients: {Emails}",
                messageType,
                recipients.Count,
                string.Join(", ", recipients.Select(r => $"{r.FirstName} <{r.Email}>")));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email for {MessageType}", messageType);
            throw;
        }
    }

    /// <summary>
    /// Sends only in-app notification to users.
    /// </summary>
    public void SendNotification(
        MessageType messageType,
        Guid? tenantId,
        List<Guid> userIds,
        string language,
        object templateData)
    {
        if (userIds == null || !userIds.Any())
        {
            _logger.LogWarning("No user IDs provided for notification {MessageType}", messageType);
            return;
        }

        try
        {
            var notificationData = _messageTemplateService.CreateNotification(
                messageType,
                tenantId,
                userIds,
                language,
                templateData);

            _sendEmailAndNotificationService.SendNotification(notificationData);

            _logger.LogInformation(
                "[{MessageType}] Notification sent to {Count} users",
                messageType,
                userIds.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send notification for {MessageType}", messageType);
            throw;
        }
    }
}
