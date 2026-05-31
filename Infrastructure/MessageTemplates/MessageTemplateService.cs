using System.Globalization;
using MessageTemplates.Services;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Novologs.Domain.Enums;
using SystemLoaders.Services;

namespace Novologs.Infrastructure.MessageTemplates;

/// <summary>
/// Implementation of centralized message template service with localization support.
/// </summary>
public class MessageTemplateService : IMessageTemplateService
{
    private readonly IStringLocalizer _localizer;
    private readonly ILogger<MessageTemplateService> _logger;

    // Map MessageType to EmailTemplate
    private static readonly Dictionary<MessageType, EmailTemplate> EmailTemplateMap = new()
    {
        // Authentication & User Management
        { MessageType.UserCreated, EmailTemplate.RegistrationConfirmEmail },
        { MessageType.UserPasswordReset, EmailTemplate.RegistrationResetPasswordEmail },
        { MessageType.CompanyUserCreated, EmailTemplate.CompanyConfirmEmail },
        { MessageType.CompanyUserPasswordReset, EmailTemplate.CompanyResetPasswordEmail },

        // All other messages use NotificationEmail template
        { MessageType.TaskCreated, EmailTemplate.NotificationEmail },
        { MessageType.TaskUpdated, EmailTemplate.NotificationEmail },
        { MessageType.TaskDeleted, EmailTemplate.NotificationEmail },
        { MessageType.TaskStatusChanged, EmailTemplate.NotificationEmail },
        { MessageType.TaskMemberAdded, EmailTemplate.NotificationEmail },
        { MessageType.TaskMemberRemoved, EmailTemplate.NotificationEmail },
        { MessageType.TicketCreated, EmailTemplate.NotificationEmail },
        { MessageType.TicketUpdated, EmailTemplate.NotificationEmail },
        { MessageType.TicketAssigned, EmailTemplate.NotificationEmail },
        { MessageType.ProjectCreated, EmailTemplate.NotificationEmail },
        { MessageType.ProjectUpdated, EmailTemplate.NotificationEmail },
        { MessageType.ProjectDeleted, EmailTemplate.NotificationEmail },
        { MessageType.ProjectMemberAdded, EmailTemplate.NotificationEmail },
        { MessageType.ProjectMemberRemoved, EmailTemplate.NotificationEmail },
        { MessageType.UserProfileUpdated, EmailTemplate.NotificationEmail },
        { MessageType.TeamUpdated, EmailTemplate.NotificationEmail },
        { MessageType.TeamMemberAdded, EmailTemplate.NotificationEmail },
        { MessageType.TeamMemberRemoved, EmailTemplate.NotificationEmail },
        { MessageType.DocumentCreated, EmailTemplate.NotificationEmail },
        { MessageType.DocumentUpdated, EmailTemplate.NotificationEmail },
        { MessageType.DocumentMentioned, EmailTemplate.NotificationEmail },
        { MessageType.DocumentMemberAdded, EmailTemplate.NotificationEmail },
        { MessageType.DocumentMemberRemoved, EmailTemplate.NotificationEmail },
        { MessageType.TodoItemCreated, EmailTemplate.NotificationEmail },
        { MessageType.TodoItemDeleted, EmailTemplate.NotificationEmail },
        { MessageType.TodoItemStatusChanged, EmailTemplate.NotificationEmail },
        { MessageType.TodoItemAssigned, EmailTemplate.NotificationEmail },
        { MessageType.TodoItemMemberRemoved, EmailTemplate.NotificationEmail },
        { MessageType.TodoItemReminder, EmailTemplate.NotificationEmail },
        { MessageType.FolderShared, EmailTemplate.NotificationEmail },
        { MessageType.FolderAccessRemoved, EmailTemplate.NotificationEmail },
        { MessageType.FolderUpdated, EmailTemplate.NotificationEmail },
        { MessageType.CommentMentioned, EmailTemplate.NotificationEmail },
        { MessageType.CommentReply, EmailTemplate.NotificationEmail },
        { MessageType.ChatMessage, EmailTemplate.NotificationEmail },
        { MessageType.PolicyViolation, EmailTemplate.NotificationEmail },
        { MessageType.StorageAlert, EmailTemplate.NotificationEmail },
        { MessageType.TenantInitialized, EmailTemplate.NotificationEmail },
        { MessageType.General, EmailTemplate.NotificationEmail }
    };

    // Map MessageType to NotificationType
    private static readonly Dictionary<MessageType, NotificationType> NotificationTypeMap = new()
    {
        { MessageType.TaskCreated, NotificationType.AssignedTask },
        { MessageType.TaskUpdated, NotificationType.EditedTask },
        { MessageType.TaskDeleted, NotificationType.EditedTask },
        { MessageType.TaskStatusChanged, NotificationType.TaskStatusChanged },
        { MessageType.TaskMemberAdded, NotificationType.AssignedTask },
        { MessageType.TaskMemberRemoved, NotificationType.RemovedFromTask },
        { MessageType.TicketCreated, NotificationType.AssignedTask },
        { MessageType.TicketUpdated, NotificationType.EditedTask },
        { MessageType.TicketAssigned, NotificationType.AssignedTask },
        { MessageType.ProjectCreated, NotificationType.AddedToProject },
        { MessageType.ProjectUpdated, NotificationType.EditedProject },
        { MessageType.ProjectDeleted, NotificationType.EditedProject },
        { MessageType.ProjectMemberAdded, NotificationType.AddedToProject },
        { MessageType.ProjectMemberRemoved, NotificationType.RemovedFromProject },
        { MessageType.UserProfileUpdated, NotificationType.General },
        { MessageType.TeamUpdated, NotificationType.General },
        { MessageType.TeamMemberAdded, NotificationType.General },
        { MessageType.TeamMemberRemoved, NotificationType.General },
        { MessageType.DocumentCreated, NotificationType.AddedToDocument },
        { MessageType.DocumentUpdated, NotificationType.EditedDocument },
        { MessageType.DocumentMentioned, NotificationType.MentionedInDocument },
        { MessageType.DocumentMemberAdded, NotificationType.AddedToDocument },
        { MessageType.DocumentMemberRemoved, NotificationType.RemovedFromDocument },
        { MessageType.TodoItemCreated, NotificationType.AssignedTodoItem },
        { MessageType.TodoItemDeleted, NotificationType.EditedTodoItem },
        { MessageType.TodoItemStatusChanged, NotificationType.EditedTodoItem },
        { MessageType.TodoItemAssigned, NotificationType.AssignedTodoItem },
        { MessageType.TodoItemMemberRemoved, NotificationType.RemovedFromTodoItem },
        { MessageType.TodoItemReminder, NotificationType.TodoItemReminder },
        { MessageType.FolderShared, NotificationType.AddedToFolder },
        { MessageType.FolderAccessRemoved, NotificationType.RemovedFromFolder },
        { MessageType.FolderUpdated, NotificationType.EditedFolder },
        { MessageType.CommentMentioned, NotificationType.AddedToComment },
        { MessageType.CommentReply, NotificationType.AddedToCommentReply },
        { MessageType.ChatMessage, NotificationType.ChatMessage },
        { MessageType.PolicyViolation, NotificationType.General },
        { MessageType.StorageAlert, NotificationType.General },
        { MessageType.TenantInitialized, NotificationType.General },
        { MessageType.General, NotificationType.General }
    };

    public MessageTemplateService(
        IStringLocalizer localizer,
        ILogger<MessageTemplateService> logger)
    {
        _localizer = localizer;
        _logger = logger;
    }

    public EmailData CreateEmail(
        MessageType messageType,
        Guid? tenantId,
        List<EmailUserInfo> recipients,
        string language,
        object templateData)
    {
        var data = ObjectToDictionary(templateData);

        return new EmailData
        {
            TenantId = tenantId,
            EmailTemplate = GetEmailTemplate(messageType),
            UserInfo = recipients,
            Subject = GetEmailSubject(messageType, language, data),
            Message = GetEmailBody(messageType, language, data),
            Data = data
        };
    }

    public NotificationData CreateNotification(
        MessageType messageType,
        Guid? tenantId,
        List<Guid> userIds,
        string language,
        object templateData)
    {
        var data = ObjectToDictionary(templateData);

        return new NotificationData
        {
            TenantId = tenantId,
            UserIds = userIds,
            Type = GetNotificationType(messageType),
            Title = GetNotificationTitle(messageType, language, data),
            Body = GetNotificationBody(messageType, language, data),
            Data = data,
            MessageType = messageType,
            TemplateData = data
        };
    }

    public string GetEmailSubject(MessageType messageType, string language, Dictionary<string, string> data)
    {
        var key = $"{messageType}_EmailSubject";
        var template = GetLocalizedString(key, language);
        return ReplacePlaceholders(template, data);
    }

    public string GetEmailBody(MessageType messageType, string language, Dictionary<string, string> data)
    {
        var key = $"{messageType}_EmailBody";
        var template = GetLocalizedString(key, language);
        return ReplacePlaceholders(template, data);
    }

    public string GetNotificationTitle(MessageType messageType, string language, Dictionary<string, string> data)
    {
        var key = $"{messageType}_NotificationTitle";
        var template = GetLocalizedString(key, language);
        return ReplacePlaceholders(template, data);
    }

    public string GetNotificationBody(MessageType messageType, string language, Dictionary<string, string> data)
    {
        var key = $"{messageType}_NotificationBody";
        var template = GetLocalizedString(key, language);
        return ReplacePlaceholders(template, data);
    }

    public EmailTemplate GetEmailTemplate(MessageType messageType)
    {
        return EmailTemplateMap.TryGetValue(messageType, out var template)
            ? template
            : EmailTemplate.NotificationEmail;
    }

    public NotificationType GetNotificationType(MessageType messageType)
    {
        return NotificationTypeMap.TryGetValue(messageType, out var type)
            ? type
            : NotificationType.General;
    }

    private string GetLocalizedString(string key, string language)
    {
        try
        {
            // Set culture based on language
            var culture = new CultureInfo(language.ToLowerInvariant() == "ar" ? "ar" : "en");
            CultureInfo.CurrentUICulture = culture;

            var localized = _localizer[key];

            if (localized.ResourceNotFound)
            {
                _logger.LogWarning("Missing translation for key: {Key}, language: {Language}", key, language);

                // Fallback to English
                CultureInfo.CurrentUICulture = new CultureInfo("en");
                var fallback = _localizer[key];

                if (fallback.ResourceNotFound)
                {
                    _logger.LogError("Missing translation for key: {Key} in both {Language} and English", key, language);
                    return $"[{key}]"; // Return key in brackets as last resort
                }

                return fallback.Value;
            }

            return localized.Value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting localized string for key: {Key}, language: {Language}", key, language);
            return $"[{key}]";
        }
    }

    private string ReplacePlaceholders(string template, Dictionary<string, string> data)
    {
        if (string.IsNullOrEmpty(template) || data == null || !data.Any())
            return template;

        var result = template;
        foreach (var kvp in data)
        {
            result = result.Replace($"{{{kvp.Key}}}", kvp.Value ?? string.Empty);
        }

        return result;
    }

    private Dictionary<string, string> ObjectToDictionary(object obj)
    {
        if (obj == null)
            return new Dictionary<string, string>();

        if (obj is Dictionary<string, string> dict)
            return dict;

        var dictionary = new Dictionary<string, string>();
        var properties = obj.GetType().GetProperties();

        foreach (var prop in properties)
        {
            var value = prop.GetValue(obj);
            dictionary[prop.Name] = value?.ToString() ?? string.Empty;
        }

        return dictionary;
    }
}
