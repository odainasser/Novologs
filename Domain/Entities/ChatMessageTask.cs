using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ChatMessageTask(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public ChatMessageTask() : this(Guid.NewGuid()) { }

    public Guid ChatMessageId { get; set; }
    [ForeignKey(nameof(ChatMessageId))] public ChatMessage? ChatMessage { get; set; }

    public Guid TaskId { get; set; }
    [ForeignKey(nameof(TaskId))] public ProjectTask? Task { get; set; }
}
