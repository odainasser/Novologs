using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class LocalizableText(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public LocalizableText() : this(Guid.NewGuid()) { }


    public string Value { get; set; } = null!;

    public virtual ICollection<LocalizedString> LocalizedStrings { get; set; } = new HashSet<LocalizedString>();

    public string GetDefaultLocalizedString()
    {
        var defaultString = LocalizedStrings
            .FirstOrDefault(ls => ls.Language.Equals("en", StringComparison.OrdinalIgnoreCase))?.Value;
        return defaultString ?? Value;
    }
}
