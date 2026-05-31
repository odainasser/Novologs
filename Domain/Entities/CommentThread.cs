using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class CommentThread(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public CommentThread() : this(Guid.NewGuid()) { }  

    public List<CommentItem> Items { get; set; } = new();
}
