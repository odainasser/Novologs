using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Novologs.Application.Common.Behaviours;

namespace Novologs.Application;

public static class DependencyInjection
{
    /// <summary>Registers the Application layer: AutoMapper, FluentValidation, authorization, and the MediatR CQRS pipeline.</summary>
    public static void AddApplicationServices(this IHostApplicationBuilder builder)
    {
        var assembly = Assembly.GetExecutingAssembly();

        builder.Services.AddAutoMapper(cfg => cfg.AddMaps(assembly));

        builder.Services.AddValidatorsFromAssembly(assembly);

        builder.Services.AddAuthorization();
        builder.Services.AddAuthorizationFromAssembly(builder.Configuration, assembly);

        builder.Services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(UnhandledExceptionBehaviour<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(AuthorizationBehaviour<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
        });
    }
}
