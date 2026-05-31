using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Modules.Project.MileStones.Commands.AddMileStone;
using Novologs.Application.Modules.Project.MileStones.Commands.AddTasksToMileStone;
using Novologs.Application.Modules.Project.MileStones.Commands.DeleteMileStone;
using Novologs.Application.Modules.Project.MileStones.Commands.UpdateMileStone;
using Novologs.Application.Modules.Project.MileStones.Queries.GetMileStone;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class MileStoneEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/mileStones").RequireAuthorization().WithOpenApi();
        group.MapPost("/getMileStones", GetMileStones);
        group.MapPost("/addMileStone", AddMileStone);
        group.MapPut("/updateMileStone", UpdateMileStone);
        group.MapDelete("/deleteMileStone/{id}", DeleteMileStone);
        group.MapPost("/addTasksToMileStone", AddTasksToMileStone);
    }

    private async Task<Result<AddTasksToMileStoneResponse>> AddTasksToMileStone(ISender sender,
        [FromBody] AddTasksToMileStoneCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetMileStoneResponse>> GetMileStones(ISender sender, [FromBody] GetMileStoneQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AddMileStoneResponse>> AddMileStone(ISender sender,
        [FromBody] AddMileStoneCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateMileStoneResponse>> UpdateMileStone(ISender sender,
        [FromBody] UpdateMileStoneCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteMileStoneResponse>> DeleteMileStone(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteMileStoneCommand { Id = id });
    }
}
