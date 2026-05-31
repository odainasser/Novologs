using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;

namespace Novologs.Api.Endpoints.Tenant;

public class Admin : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/Admin")
            .WithTags("Admin")
            .WithOpenApi()
            .RequireAuthorization(); // Require authentication for all admin endpoints

        // Migration endpoints can be added here in the future
        // For account seeding, use SQL script or console app for existing tenants
    }
}
