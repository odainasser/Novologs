using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Application.Modules.Tasks.Priorities.Commands.AddPriority;
using Novologs.Application.Modules.Tasks.Priorities.Commands.DeletePriority;
using Novologs.Application.Modules.Tasks.Priorities.Commands.UpdatePriority;
using Novologs.Application.Modules.Tasks.Priorities.Queries.GetPriority;
using Novologs.Api.Infrastructure;

namespace Novologs.Api.Endpoints.Task;

public class Priorities : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/Priority").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/addPriority", AddPriority);
        manageGroup.MapPut("/updatePriority", UpdatePriority);
        manageGroup.MapDelete("/deletePriority/{id}", DeletePriority);
        manageGroup.MapPost("/getPriority", GetPriority);
    }

    private async Task<Result<GetPriorityResponse>> GetPriority([FromServices] ISender sender,
        [FromBody] GetPriorityQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<DeletePriorityResponse>> DeletePriority([FromServices] ISender sender, Guid id)
    {
        //TODO Add authorization checks (my created )
        var command = new DeletePriorityCommand() { Id = id };
        return await sender.Send(command);
    }

    private async Task<Result<UpdatePriorityResponse>> UpdatePriority([FromServices] ISender sender,
        [FromBody] UpdatePriorityCommand command)
    {
        //TODO Test
        //TODO Add authorization checks (my created)
        return await sender.Send(command);
    }

    private async Task<Result<AddPriorityResponse>> AddPriority([FromServices] ISender sender,
        [FromBody] AddPriorityCommand command)
    {
        //TODO Add authorization checks (members level, no assign task permission )
        return await sender.Send(command);
    }
}
