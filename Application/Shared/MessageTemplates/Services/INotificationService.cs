using Novologs.Domain.Enums;
using SystemLoaders.Services;

namespace MessageTemplates.Services;

/// <summary>
/// Unified service for sending both emails and notifications together.
/// Eliminates the need for separate TaskEmailService, TicketEmailService, etc.
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// Sends both email and in-app notification to recipients.
    /// </summary>
    /// <param name="messageType">Type of message to send</param>
    /// <param name="tenantId">Tenant ID for multi-tenant context</param>
    /// <param name="recipients">List of email recipients (also used for notifications)</param>
    /// <param name="language">Language code (e.g., "EN", "AR")</param>
    /// <param name="templateData">Anonymous object containing template placeholders</param>
    void SendEmailAndNotification(
        MessageType messageType,
        Guid? tenantId,
        List<EmailUserInfo> recipients,
        string language,
        object templateData);

    /// <summary>
    /// Sends only email to recipients.
    /// </summary>
    /// <param name="messageType">Type of message to send</param>
    /// <param name="tenantId">Tenant ID for multi-tenant context</param>
    /// <param name="recipients">List of email recipients</param>
    /// <param name="language">Language code (e.g., "EN", "AR")</param>
    /// <param name="templateData">Anonymous object containing template placeholders</param>
    void SendEmail(
        MessageType messageType,
        Guid? tenantId,
        List<EmailUserInfo> recipients,
        string language,
        object templateData);

    /// <summary>
    /// Sends only in-app notification to users.
    /// </summary>
    /// <param name="messageType">Type of message to send</param>
    /// <param name="tenantId">Tenant ID for multi-tenant context</param>
    /// <param name="userIds">List of user IDs to receive notification</param>
    /// <param name="language">Language code (e.g., "EN", "AR")</param>
    /// <param name="templateData">Anonymous object containing template placeholders</param>
    void SendNotification(
        MessageType messageType,
        Guid? tenantId,
        List<Guid> userIds,
        string language,
        object templateData);
}
