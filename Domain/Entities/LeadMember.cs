using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;
using Novologs.Domain.Enums;

namespace Novologs.Domain.Entities;

public class LeadMember(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public LeadMember() : this(Guid.NewGuid()) { }

    public Guid LeadId { get; set; }
    [ForeignKey(nameof(LeadId))] public ClientLead Lead { get; set; } = null!;

    public Guid MemberId { get; set; }
    [ForeignKey(nameof(MemberId))] public TenantUser Member { get; set; } = null!;

    public LeadMemberPermission PermissionLevel { get; set; }
}
