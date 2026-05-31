using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class LocalizedString(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public LocalizedString() : this(Guid.NewGuid()) { }

    public Guid LocalizableId { get; set; }

    public string Language { get; set; } = "en";

    public string Value { get; set; } = null!;

    [ForeignKey(nameof(LocalizableId))] public LocalizableText Localizable { get; set; } = null!;
}
