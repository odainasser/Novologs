using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class TenantUsersLinkedTo(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    // The user in THIS tenant who created the link
    public Guid SourceUserId { get; set; }
    [ForeignKey(nameof(SourceUserId))] public TenantUser? SourceUser { get; set; }

    // Info about the remote tenant being linked TO
    public Guid TargetTenantId { get; set; }
    public string TargetDomain { get; set; } = null!;
    public string TargetTenantName { get; set; } = null!;

    public Guid TargetUserId { get; set; }
    public string? TargetUserFullName { get; set; }
    public string? TargetUserEmail { get; set; }
    public string? TargetUserProfilePictureUrl { get; set; }

    // Hash of the token from the target tenant to prove the link
    public string LinkTokenHash { get; set; } = null!;
    public bool IsActive { get; set; } = true;
}
