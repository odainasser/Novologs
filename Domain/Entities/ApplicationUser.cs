using Microsoft.AspNetCore.Identity;

namespace Novologs.Domain.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public string? FullName { get; set; }
    public string? Country { get; set; }

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenValidTill { get; set; }

    public virtual ICollection<AppTenantInfo> TenantList { get; set; } = new List<AppTenantInfo>();
}
