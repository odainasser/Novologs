using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Novologs.Api.Services;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Api;

public static class DependencyInjection
{
    /// <summary>Registers the API (presentation) layer: HTTP context, current user, endpoint explorer, Swagger.</summary>
    public static void AddApiServices(this IHostApplicationBuilder builder)
    {
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddScoped<IUser, CurrentUser>();

        // CORS for the Next.js frontend (Bearer-token auth, so any origin is fine for dev).
        builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo { Title = "Novologs API", Version = "v1" });
            // Modules define same-named DTOs (e.g. TenantUserDto) — use full type name as schemaId to avoid collisions.
            options.CustomSchemaIds(type => (type.FullName ?? type.Name).Replace("+", "."));

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] then your token.",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                    },
                    Array.Empty<string>()
                }
            });
        });
    }
}
