using Novologs.Domain.Entities;

namespace Novologs.Application.Common.Services;

public interface ICurrentTenant
{
    public AppTenantInfo? TenantInfo { get; }
}
