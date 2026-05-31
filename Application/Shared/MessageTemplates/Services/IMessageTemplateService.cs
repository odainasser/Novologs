using Novologs.Domain.Enums;
using SystemLoaders.Services;

namespace MessageTemplates.Services;

/// <summary>
/// Service for creating localized email and notification messages using centralized templates.
/// Eliminates hardcoded messages and provides multi-language support.
/// </summary>
public interface IMessageTemplateService
{
    /// <summary>
    /// Creates complete EmailData with localized subject and message based on message type.
    /// </summary>
    /// <param name="messageType">Type of message to create</param>
    /// <param name="tenantId">Tenant ID for multi-tenant context</param>
    /// <param name="recipients">List of email recipients</param>
    /// <param name="language">Language code (e.g., "EN", "AR")</param>
    /// <param name="templateData">Anonymous object containing template placeholders (e.g., new { TaskSerial = "T-123", Description = "..." })</param>
    /// <returns>Fully populated EmailData ready to be sent</returns>
    EmailData CreateEmail(
        MessageType messageType,
        Guid? tenantId,
        List<EmailUserInfo> recipients,
        string language,
        object templateData);

    /// <summary>
    /// Creates complete NotificationData with localized title and body based on message type.
    /// </summary>
    /// <param name="messageType">Type of message to create</param>
    /// <param name="tenantId">Tenant ID for multi-tenant context</param>
    /// <param name="userIds">List of user IDs to receive notification</param>
    /// <param name="language">Language code (e.g., "EN", "AR")</param>
    /// <param name="templateData">Anonymous object containing template placeholders</param>
    /// <returns>Fully populated NotificationData ready to be sent</returns>
    NotificationData CreateNotification(
        MessageType messageType,
        Guid? tenantId,
        List<Guid> userIds,
        string language,
        object templateData);

    /// <summary>
    /// Gets localized email subject for a specific message type.
    /// </summary>
    /// <param name="messageType">Type of message</param>
    /// <param name="language">Language code</param>
    /// <param name="data">Dictionary of placeholder values</param>
    /// <returns>Localized subject with placeholders replaced</returns>
    string GetEmailSubject(MessageType messageType, string language, Dictionary<string, string> data);

    /// <summary>
    /// Gets localized email body/message for a specific message type.
    /// </summary>
    /// <param name="messageType">Type of message</param>
    /// <param name="language">Language code</param>
    /// <param name="data">Dictionary of placeholder values</param>
    /// <returns>Localized body with placeholders replaced</returns>
    string GetEmailBody(MessageType messageType, string language, Dictionary<string, string> data);

    /// <summary>
    /// Gets localized notification title for a specific message type.
    /// </summary>
    /// <param name="messageType">Type of message</param>
    /// <param name="language">Language code</param>
    /// <param name="data">Dictionary of placeholder values</param>
    /// <returns>Localized title with placeholders replaced</returns>
    string GetNotificationTitle(MessageType messageType, string language, Dictionary<string, string> data);

    /// <summary>
    /// Gets localized notification body for a specific message type.
    /// </summary>
    /// <param name="messageType">Type of message</param>
    /// <param name="language">Language code</param>
    /// <param name="data">Dictionary of placeholder values</param>
    /// <returns>Localized body with placeholders replaced</returns>
    string GetNotificationBody(MessageType messageType, string language, Dictionary<string, string> data);

    /// <summary>
    /// Maps MessageType to EmailTemplate enum.
    /// </summary>
    /// <param name="messageType">Type of message</param>
    /// <returns>Corresponding EmailTemplate</returns>
    EmailTemplate GetEmailTemplate(MessageType messageType);

    /// <summary>
    /// Maps MessageType to NotificationType enum.
    /// </summary>
    /// <param name="messageType">Type of message</param>
    /// <returns>Corresponding NotificationType</returns>
    NotificationType GetNotificationType(MessageType messageType);
}
