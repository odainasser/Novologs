using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Finbuckle.MultiTenant.Abstractions;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class AppTenantInfo : BaseDeletableAuditableEntity<Guid>, ITenantInfo, ICodeAndSerialEntity
{
    public AppTenantInfo() : base(Guid.NewGuid())
    {
    }

    [MaxLength(200)] public string? Code { get; set; }
    public long Serial { get; set; }

    public int SeatCount { get; set; }

    public string? ConnectionString { get; set; }

    public string? Domain { get; set; }

    public Guid ManagementToken { get; set; }

    public Guid OwnerId { get; set; }

    public string Identifier { get; set; } = null!;

    public string? Name { get; set; }
    public string? Policy { get; set; }
    public bool PaymentApproval { get; set; }
    [ForeignKey(nameof(OwnerId))] public virtual ApplicationUser Owner { get; set; } = null!;

    string ITenantInfo.Id => base.Id.ToString();
}
