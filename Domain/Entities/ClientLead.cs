using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class ClientLead(Guid id) : BaseDeletableAuditableEntity<Guid>(id), ICodeAndSerialEntity
{
    public ClientLead() : this(Guid.NewGuid()) { }

    [MaxLength(200)] public string? Code { get; set; } = null!;
    public long Serial { get; set; }

    [MaxLength(2048)] public string Name { get; set; } = null!;

    public Guid CreatorId { get; set; }
    [ForeignKey(nameof(CreatorId))] public TenantUser? Creator { get; set; }
    
    public Guid? ClientId { get; set; }
    [ForeignKey(nameof(ClientId))] public Client? Client { get; set; }

    public bool IsShared { get; set; } = false;
    public ICollection<LeadMember> LeadMembers { get; set; } = new List<LeadMember>();

    public Guid? LeadSourceId { get; set; }
    [ForeignKey(nameof(LeadSourceId))] public LeadSource? LeadSource { get; set; }

    public double? Value { get; set; }
    public Guid? CurrencyId { get; set; }
    [ForeignKey(nameof(CurrencyId))] public Currency? Currency { get; set; }

    public double? Probability { get; set; }


    public DateTime? ExpectedAwardedDate { get; set; }
    public LeadStatus LeadStatus { get; set; } = LeadStatus.Open;

    public Guid? SaleStatusId { get; set; }
    [ForeignKey(nameof(SaleStatusId))] public LeadSaleStatus? SaleStatus { get; set; }

    public double? AwardedValue { get; set; }
    public Guid? AwardedCurrencyId { get; set; }

    [ForeignKey(nameof(AwardedCurrencyId))]
    public Currency? AwardedCurrency { get; set; }

    public DateTime? AwardedDate { get; set; }

    public DateTime? RejectedDate { get; set; }
    public Guid? RejectionReasonId { get; set; }

    [ForeignKey(nameof(RejectionReasonId))]
    public LeadRejectionReason? RejectionReason { get; set; }

    public Guid? DocumentId { get; set; }
    [ForeignKey(nameof(DocumentId))] public DocumentNode? Document { get; set; }

    public ICollection<LeadUpdate> LeadUpdates { get; set; } = new List<LeadUpdate>();
}
