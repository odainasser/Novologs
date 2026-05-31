using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class LeadSaleStatus(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{ 
    public LeadSaleStatus() : this(Guid.NewGuid()) { }
    

    public Guid NameId { get; set; }
    [ForeignKey(nameof(NameId))] public required LocalizableText Name { get; set; }

    public List<ClientLead> ClientLeads { get; set; } = new();
}
