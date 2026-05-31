using Hangfire;
using Novologs.Domain.Enums;

namespace SystemLoaders.Services;

public interface INotificationBackgroundService
{
    [Queue("notifications")]
    Task SendNotificationAsync(NotificationData notificationData);
}

public class NotificationData
{
    public Guid? TenantId { get; set; }
    public List<Guid> UserIds { get; set; } = new();
    public string Title { get; set; } = null!;
    public string Body { get; set; } = null!;
    public NotificationType Type { get; set; } = NotificationType.General;
    public Dictionary<string, string>? Data { get; set; } = new();
    public int RetryCount { get; set; } = 0;
    
    /// <summary>
    /// Template key used to generate localized Title/Body. When set, notifications can be localized dynamically.
    /// </summary>
    public MessageType? MessageType { get; set; }
    
    /// <summary>
    /// Template data used to populate placeholders in localized templates.
    /// </summary>
    public Dictionary<string, string>? TemplateData { get; set; }
}

public class NotificationUserInfo
{
    public Guid? Id { get; set; }
    public string? FullName { get; set; }
    public List<FcmDeviceToken> FcmDeviceTokenList { get; set; } = new();
}

public class FcmDeviceToken
{
    //add token and device type
    public string Token { get; set; } = null!;
    public DeviceType DeviceType { get; set; }
}