using System.Security.Claims;
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Services;

namespace Novologs.Infrastructure.Services;

public class CurrentTenant : ICurrentTenant
{
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _tenantContextAccessor;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IRegistrationDbContext _regDbContext;

    private AppTenantInfo? _tenantInfo;
    private bool _loaded;

    public CurrentTenant(IMultiTenantContextAccessor<AppTenantInfo> tenantContextAccessor,
        IServiceProvider serviceProvider, IConfiguration configuration,
        IHttpContextAccessor httpContextAccessor, IRegistrationDbContext regDbContext)
    {
        _tenantContextAccessor = tenantContextAccessor;
        _httpContextAccessor = httpContextAccessor;
        _regDbContext = regDbContext;
    }

    public AppTenantInfo? TenantInfo
    {
        get
        {
            if (_loaded) return _tenantInfo;

            _tenantInfo = _tenantContextAccessor.MultiTenantContext?.TenantInfo;
            if (_tenantInfo == null)
            {
                var userClaims = _httpContextAccessor.HttpContext?.User;
                if (userClaims != null && Guid.TryParse(userClaims.FindFirstValue(ClaimTypes.System), out var tenantId))
                {
                    _tenantInfo = _regDbContext.GetSet<AppTenantInfo>().FirstOrDefault(x => x.Id == tenantId);
                }
            }

            _loaded = true;
            return _tenantInfo;
        }
    }
}
