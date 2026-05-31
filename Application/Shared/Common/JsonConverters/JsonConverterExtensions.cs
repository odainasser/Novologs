using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.DependencyInjection;

namespace SystemLoaders.Common.JsonConverters;

public static class JsonConverterExtensions
{
    /// <summary>
    /// Configures common JSON converters including NullableGuidConverter to handle empty strings as null.
    /// This is automatically applied to all services.
    /// </summary>
    public static IServiceCollection AddCommonJsonConverters(this IServiceCollection services)
    {
        services.Configure<JsonOptions>(options =>
        {
            options.SerializerOptions.Converters.Add(new NullableGuidConverter());
            options.SerializerOptions.Converters.Add(new GuidConverter());
        });

        return services;
    }
}
