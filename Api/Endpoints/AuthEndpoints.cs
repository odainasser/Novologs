using MediatR;
using Novologs.Api.Infrastructure;
using Novologs.Application.User.Commands.Login;
using Novologs.Application.User.Commands.Refresh;

namespace Novologs.Api.Endpoints;

/// <summary>Anonymous authentication endpoints: login (issue JWT) and refresh.</summary>
public class AuthEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/auth").WithTags("Auth").AllowAnonymous();

        group.MapPost("/login", async (LoginCommand command, ISender sender) =>
            Results.Ok(await sender.Send(command)));

        group.MapPost("/refresh", async (RefreshCommand command, ISender sender) =>
            Results.Ok(await sender.Send(command)));
    }
}
