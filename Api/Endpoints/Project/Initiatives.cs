namespace Microsoft.Extensions.DependencyInjection.Endpoints;

using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Modules.Project.Initiatives.Commands.AddInitiative;
using Novologs.Application.Modules.Project.Initiatives.Commands.DeleteInitiative;
using Novologs.Application.Modules.Project.Initiatives.Commands.UpdateInitiative;
using Novologs.Application.Modules.Project.Initiatives.Queries.GetInitiative;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

public class Initiatives : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        //TODO Add authorization
        var manageGroup = app.MapGroup("/manage").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getInitiatives", GetInitiatives);
        manageGroup.MapPost("/addInitiative", AddInitiative);
        manageGroup.MapDelete("/deleteInitiative/{id}", DeleteInitiative);
        manageGroup.MapPut("/updateInitiative", UpdateInitiative);
    }

    private async Task<Result<AddInitiativeResponse>> AddInitiative([FromBody] AddInitiativeCommand command,
        [FromServices] ISender sender)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetInitiativeResponse>> GetInitiatives([FromBody] GetInitiativeQuery query,
        [FromServices] ISender sender)
    {
        return await sender.Send(query);
    }

    private async Task<Result<DeleteInitiativeResponse>> DeleteInitiative([FromServices] ISender sender, Guid Id)
    {
        var command = new DeleteInitiativeCommand() { Id = Id };
        return await sender.Send(command);
    }

    private async Task<Result<UpdateInitiativeResponse>> UpdateInitiative([FromBody] UpdateInitiativeCommand command,
        [FromServices] ISender sender)
    {
        return await sender.Send(command);
    }
}
