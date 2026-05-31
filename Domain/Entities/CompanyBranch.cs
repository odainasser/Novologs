using System.ComponentModel.DataAnnotations;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class CompanyBranch(Guid id) : BaseDeletableAuditableEntity<Guid>(id), ICodeAndSerialEntity
{
    public CompanyBranch() : this(Guid.NewGuid()) { }

    [MaxLength(200)] public string? Code { get; set; } = null!;
    public long Serial { get; set; }

    [MaxLength(2048)] public string Name { get; set; } = null!;
    [MaxLength(20)] public string? Phone { get; set; }
    [MaxLength(256)] public string? Email { get; set; }
    [MaxLength(100)] public string? Country { get; set; }
    [MaxLength(100)] public string? City { get; set; }
    [MaxLength(2048)] public string? Address { get; set; }
}
