using MediatR;
using Novologs.Api.Infrastructure;
using Novologs.Application.Modules.Samples.Queries.GetSystemInfo;

namespace Novologs.Api.Endpoints;

/// <summary>Sample endpoint group — proves the API host wires MediatR end to end.</summary>
public class SystemEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGet("/system/info", async (ISender sender) =>
            {
                var result = await sender.Send(new GetSystemInfoQuery());
                return Results.Ok(result);
            })
            .WithTags("System");
    }
}
