using Novologs.Application.Modules.Client.Clients.Commands.AddClient;
using Novologs.Application.Modules.Client.Clients.Commands.DeleteClient;
using Novologs.Application.Modules.Client.Clients.Commands.UpdateClient;
using Novologs.Application.Modules.Client.Clients.Queries.GetClient;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class Clients : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/client").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getClients", GetClients);
        manageGroup.MapPost("/addClient", AddClient);
        manageGroup.MapPut("/updateClient", UpdateClient);
        manageGroup.MapDelete("/deleteClient/{id}", DeleteClient);
    }

    private async Task<Result<AddClientResponse>> AddClient([FromBody] AddClientCommand command,
        [FromServices] ISender sender)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetClientResponse>> GetClients([FromBody] GetClientQuery query,
        [FromServices] ISender sender)
    {
        return await sender.Send(query);
    }

    private async Task<Result<DeleteClientResponse>> DeleteClient(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteClientCommand { Id = id });
    }

    private async Task<Result<UpdateClientResponse>> UpdateClient([FromBody] UpdateClientCommand command,
        [FromServices] ISender sender)
    {
        return await sender.Send(command);
    }
}
