using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class Contact(Guid id) : BaseDeletableAuditableEntity<Guid>(id)
{
    public Contact() : this(Guid.NewGuid()) { }

    [MaxLength(2048)] public string Name { get; set; } = null!;
    [MaxLength(1024)] public string? Email { get; set; }
    [MaxLength(512)] public string? MobileNumber { get; set; }
    [MaxLength(512)] public string? PhoneNumber { get; set; }
    [MaxLength(1024)] public string? Designation { get; set; }

    public Guid? ClientId { get; set; }
    [ForeignKey(nameof(ClientId))] public Client? Client { get; set; }

    public Guid? VendorId { get; set; }
    [ForeignKey(nameof(VendorId))] public Vendor? Vendor { get; set; }
}
