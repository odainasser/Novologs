namespace Novologs.Application.Common.Services;

public interface ITenantService
{
    Task InitTenant(string email, string username, string password, string? fullName, string? country = null, string? phoneNumber = null);
} 
