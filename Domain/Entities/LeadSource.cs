using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class LeadSource(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{ 
    public LeadSource() : this(Guid.NewGuid()) { }
    

    public Guid NameId { get; set; }
    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; }
    public List<ClientLead> ClientLeads { get; set; } = new();
}
