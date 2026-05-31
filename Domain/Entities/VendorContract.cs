using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class VendorContract(Guid id) : BaseDeletableAuditableEntity<Guid>(id), ICodeAndSerialEntity
{
    public VendorContract() : this(Guid.NewGuid()) { }

    [MaxLength(200)] public string? Code { get; set; } = null!;
    public long Serial { get; set; }

    [MaxLength(2048)] public string Name { get; set; } = null!;

    [MaxLength(2048 * 4)] public string? Description { get; set; }


    public Guid CreatorId { get; set; }
    [ForeignKey(nameof(CreatorId))] public TenantUser? Creator { get; set; }
    public Guid VendorId { get; set; }
    [ForeignKey(nameof(VendorId))] public Vendor? Vendor { get; set; }
 
    public Guid? VendorContractTypeId { get; set; }
    [ForeignKey(nameof(VendorContractTypeId))] public VendorContractType? VendorContractType { get; set; }

    public Guid? VendorContractStatusId { get; set; }
    [ForeignKey(nameof(VendorContractStatusId))] public VendorContractStatus? VendorContractStatus { get; set; }

    public double? Value { get; set; }

    public Guid? CurrencyId { get; set; }
    [ForeignKey(nameof(CurrencyId))] public Currency? Currency { get; set; }

    public DateTime? ExpectedStartDate { get; set; }
    public DateTime? ExpectedEndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }

    public Guid? DocumentId { get; set; }
    [ForeignKey(nameof(DocumentId))] public DocumentNode? Document { get; set; }
}
