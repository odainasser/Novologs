using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class LeadUpdate(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public LeadUpdate() : this(Guid.NewGuid()) { }

    public Guid LeadId { get; set; }
    [ForeignKey(nameof(LeadId))] public ClientLead? Lead { get; set; }

    public Guid CreatorId { get; set; }
    [ForeignKey(nameof(CreatorId))] public TenantUser? Creator { get; set; }

    [MaxLength(4096)] public string Description { get; set; } = null!;

    [MaxLength(500)] public string? Status { get; set; }

    public ICollection<TodoItem> TodoItems { get; set; } = new List<TodoItem>();
}
