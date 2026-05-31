using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Enums;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class Notification(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public Notification() : this(Guid.NewGuid()) { }
    public Guid? TenantId { get; set; }
    public Guid? UserId { get; set; }
    [ForeignKey(nameof(UserId))] public TenantUser? User { get; set; }
    public string Title { get; set; } = null!;
    public string Body { get; set; } = null!;
    public NotificationType Type { get; set; } = NotificationType.General;
    public Dictionary<string, string>? Data { get; set; } = new();
    public bool IsRead { get; set; } = false;
    
    /// <summary>
    /// Template key used to generate localized Title/Body. Nullable for backward compatibility with existing notifications.
    /// </summary>
    public MessageType? MessageType { get; set; }
    
    /// <summary>
    /// Template data used to populate placeholders in localized templates. Nullable for backward compatibility.
    /// </summary>
    public Dictionary<string, string>? TemplateData { get; set; }
}
