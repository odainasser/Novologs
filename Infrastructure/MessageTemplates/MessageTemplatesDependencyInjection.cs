using MessageTemplates.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Localization;

namespace Novologs.Infrastructure.MessageTemplates;

/// <summary>
/// Extension methods for registering the centralized message template services
/// (ported from the original standalone MessageTemplates project) with localization support.
/// </summary>
public static class MessageTemplatesDependencyInjection
{
    public static IServiceCollection AddMessageTemplates(this IServiceCollection services)
    {
        // Add localization support (resx files live under Infrastructure/Resources).
        services.AddLocalization(options => options.ResourcesPath = "Resources");

        // Register the message template service.
        services.AddScoped<IMessageTemplateService, MessageTemplateService>();

        // Register the unified notification service.
        services.AddScoped<INotificationService, NotificationService>();

        // Register IStringLocalizer for the Messages resource located in this assembly.
        services.AddScoped<IStringLocalizer>(provider =>
        {
            var factory = provider.GetRequiredService<IStringLocalizerFactory>();
            var assemblyName = typeof(MessageTemplateService).Assembly.GetName().Name!;
            return factory.Create("Messages", assemblyName);
        });

        return services;
    }
}
