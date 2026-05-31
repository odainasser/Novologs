using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Novologs.Application;

public static class AuthorizationFromAssembly
{
    /// <summary>Registers every per-use-case <see cref="IAuthorizationHandler"/> found in the assembly.</summary>
    public static IServiceCollection AddAuthorizationFromAssembly(this IServiceCollection services,
        IConfiguration configuration, Assembly? assembly = null)
    {
        assembly ??= Assembly.GetExecutingAssembly();

        var handlers = assembly.GetTypes()
            .Where(t => typeof(IAuthorizationHandler).IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract);

        foreach (var handler in handlers)
        {
            services.AddScoped(typeof(IAuthorizationHandler), handler);
        }

        return services;
    }
}
