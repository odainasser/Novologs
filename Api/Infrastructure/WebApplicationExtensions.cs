using Novologs.Api.Infrastructure;

namespace Microsoft.AspNetCore.Builder;

public static class WebApplicationExtensions
{
    /// <summary>Discovers every <see cref="EndpointGroupBase"/> in the API assembly and maps it.</summary>
    public static WebApplication MapEndpoints(this WebApplication app)
    {
        var endpointGroupType = typeof(EndpointGroupBase);
        var assembly = typeof(Program).Assembly;

        var endpointGroupTypes = assembly.GetExportedTypes()
            .Where(t => t.IsSubclassOf(endpointGroupType));

        foreach (var type in endpointGroupTypes)
        {
            if (Activator.CreateInstance(type) is EndpointGroupBase instance)
            {
                instance.Map(app);
            }
        }

        return app;
    }
}
