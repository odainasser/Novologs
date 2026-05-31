namespace Microsoft.Extensions.DependencyInjection.Endpoints;


using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Modules.Project.Modules.Commands.AddModule;
using Novologs.Application.Modules.Project.Modules.Commands.DeleteModule;
using Novologs.Application.Modules.Project.Modules.Commands.UpdateModule;
using Novologs.Application.Modules.Project.Modules.Queries.GetModule;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

public class Modules : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        //TODO Add authorization
        var manageGroup = app.MapGroup("/manage").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getModules", GetModules);
        manageGroup.MapPost("/addModule", AddModule);
        manageGroup.MapDelete("/deleteModule/{id}", DeleteModule);
        manageGroup.MapPut("/updateModule", UpdateModule);
    }

    private async Task<Result<AddModuleResponse>> AddModule([FromBody] AddModuleCommand command,
        [FromServices] ISender sender)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetModuleResponse>> GetModules([FromBody] GetModuleQuery query,
        [FromServices] ISender sender)
    {
        return await sender.Send(query);
    }

    private async Task<Result<DeleteModuleResponse>> DeleteModule([FromServices] ISender sender, Guid Id)
    {
        var command = new DeleteModuleCommand() { Id = Id };
        return await sender.Send(command);
    }

    private async Task<Result<UpdateModuleResponse>> UpdateModule([FromBody] UpdateModuleCommand command,
        [FromServices] ISender sender)
    {
        return await sender.Send(command);
    }
}
