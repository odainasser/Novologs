using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class TenantUsersLinkedFrom(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    // Info about the remote tenant who initiated the link
    public Guid SourceTenantId { get; set; }
    public string SourceDomain { get; set; } = null!;
    public string SourceTenantName { get; set; } = null!;
    public Guid SourceUserId { get; set; }
    public string? SourceUserFullName { get; set; }
    public string? SourceUserEmail { get; set; }
    public string? SourceUserProfilePictureUrl { get; set; }

    // The user in THIS tenant who is the target of the link
    public Guid TargetUserId { get; set; }
    [ForeignKey(nameof(TargetUserId))] public TenantUser? TargetUser { get; set; }

    // Hash of the token given to the source tenant to prove the link
    public string LinkTokenHash { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}
