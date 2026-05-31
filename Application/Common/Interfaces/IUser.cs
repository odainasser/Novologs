namespace Novologs.Application.Common.Interfaces;

/// <summary>Ambient information about the current authenticated user/tenant.</summary>
public interface IUser
{
    string? Id { get; set; }
    string? Tenant { get; set; }

    Guid? IdGuid => Guid.TryParse(Id, out var guid) ? guid : null;
    Guid? TenantGuid => Guid.TryParse(Tenant, out var guid) ? guid : null;
}
