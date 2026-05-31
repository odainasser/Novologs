using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class Vendor(Guid id) : BaseDeletableAuditableEntity<Guid>(id), ICodeAndSerialEntity
{
    public Vendor() : this(Guid.NewGuid()) { }

    [MaxLength(200)] public string? Code { get; set; } = null!;
    public long Serial { get; set; }

    [MaxLength(2048)] public string Name { get; set; } = null!;
    [MaxLength(2048)] public string? Website { get; set; } = null!;
    [MaxLength(2048)] public string? Address { get; set; } = null!;
    [MaxLength(1024)] public string? Email { get; set; } = null!;
    [MaxLength(512)] public string? Phonenumber { get; set; } = null!;
    [MaxLength(512)] public string? Emirate { get; set; } = null!;
    public double? LocationLatitude { get; set; }
    public double? LocationLongitude { get; set; }
    public bool IsAccount { get; set; } = false;
    public Guid? LogoFileId { get; set; }
    [ForeignKey(nameof(LogoFileId))] public Folder? LogoFile { get; set; }

    public Guid CreatorId { get; set; }
    [ForeignKey(nameof(CreatorId))] public TenantUser? Creator { get; set; }

    public Guid? DocumentId { get; set; }
    [ForeignKey(nameof(DocumentId))] public DocumentNode? Document { get; set; }
    
    public ICollection<Contact> Contacts { get; set; } = new HashSet<Contact>();

    public ICollection<VendorContract> VendorContracts { get; set; } = new HashSet<VendorContract>();
}
