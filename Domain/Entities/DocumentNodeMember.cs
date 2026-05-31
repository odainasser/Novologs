using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class DocumentNodeMember(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public DocumentNodeMember(): this(Guid.NewGuid()) { }
    
    public DocumentMemeberRole Role { get; set; } = DocumentMemeberRole.Viewer;
    public bool IsMention { get; set; } = false;

    public Guid MemberId { get; set; }
    [ForeignKey(nameof(MemberId))] public TenantUser? Member { get; set; }

    public Guid NodeId { get; set; }
    [ForeignKey(nameof(NodeId))] public DocumentNode? Node { get; set; }
}
