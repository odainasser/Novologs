using System.ComponentModel.DataAnnotations.Schema;
using Novologs.Domain.Common;

namespace Novologs.Domain.Entities;

public class UserLoginInfo : BaseDeletableAuditableEntity<Guid>
{
    public UserLoginInfo() : base(Guid.NewGuid())
    {
    }

    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))] public TenantUser User { get; set; } = null!;

    public Guid AcceessTokenJti { get; set; }
    public DeviceType DeviceType { get; set; }
    public string? DeviceTypeData { get; set; }
    public string? FcmDeviceToken { get; set; }
    public DateTime LastLogin { get; set; }
    public DateTime ValidTill { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime RefreshTokenValidTill { get; set; }
}
